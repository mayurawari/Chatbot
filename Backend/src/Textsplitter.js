import { config } from "dotenv";
config();

import { createClient } from "@supabase/supabase-js";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { PineconeEmbeddings } from "@langchain/pinecone";
import { Document } from "langchain/document";
import fs from "fs/promises";

// --- Helper: Split script into atomic Q&A pairs ---
function splitScriptToQA(rawText) {
  const lines = rawText.split('\n');
  let currentIntent = null;
  let examples = [];
  let responses = [];
  let mode = '';
  const qaPairs = [];

  function flush() {
    if (currentIntent && examples.length && responses.length) {
      examples.forEach(example => {
        responses.forEach(response => {
          qaPairs.push({
            intent: currentIntent,
            example,
            response
          });
        });
      });
    }
    examples = [];
    responses = [];
  }

  for (let rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith('Intent:')) {
      flush();
      currentIntent = line.replace('Intent:', '').trim();
      mode = '';
    } else if (line.startsWith('Examples:')) {
      mode = 'examples';
    } else if (line.startsWith('Responses:')) {
      mode = 'responses';
    } else if (line.startsWith('- ')) {
      if (mode === 'examples') {
        examples.push(line.slice(2).trim());
      } else if (mode === 'responses') {
        responses.push(line.slice(2).trim());
      }
    } else {
      mode = '';
    }
  }
  flush(); // flush last intent
  return qaPairs;
}

// --- Helper: Batch array into chunks ---
function chunkArray(array, chunkSize) {
  const result = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}

const BATCH_SIZE = 96;

const run = async () => {
  // Debug to ensure envs loaded
  console.log("SUPABASE_URL:", process.env.SUPABASE_URL ? "✅" : "❌");
  console.log("SUPABASE_API_KEY:", process.env.SUPABASE_API_KEY ? "✅" : "❌");
  console.log("PINECONE_API_KEY:", process.env.PINECONE_API_KEY ? "✅" : "❌");

  const client = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_API_KEY
  );

  const embeddings = new PineconeEmbeddings({
    apiKey: process.env.PINECONE_API_KEY,
    model: "multilingual-e5-large",
  });

  const rawText = await fs.readFile("./custom script.txt", "utf-8");

  // --- Step 1: Split into atomic Q&A pairs ---
  const qaPairs = splitScriptToQA(rawText);

  // --- Step 2: Convert each Q&A pair into a Document ---
  const docs = qaPairs.map((qa, i) => {
    return new Document({
      pageContent: qa.example, // Use the example as the main content for embedding
      metadata: {
        intent: qa.intent,
        response: qa.response,
        index: i + 1,
      }
    });
  });

  // --- Step 3: Batch and store embeddings in Supabase ---
  const docBatches = chunkArray(docs, BATCH_SIZE);

  for (const [i, batch] of docBatches.entries()) {
    await SupabaseVectorStore.fromDocuments(
      batch,
      embeddings,
      {
        client,
        tableName: "documents", // Your Supabase vector table name
        queryName: "match_documents", // Supabase function name
      }
    );
    console.log(`✅ Batch ${i + 1}/${docBatches.length} of ${batch.length} embeddings stored.`);
  }

  console.log("🎉 All embeddings stored in Supabase.");
};

run().catch((err) => console.error("❌ Error:", err));
