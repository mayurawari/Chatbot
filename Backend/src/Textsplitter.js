import { config } from "dotenv";
config(); // ✅ Load .env before anything else

import { createClient } from "@supabase/supabase-js";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { PineconeEmbeddings } from "@langchain/pinecone";
import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import fs from "fs/promises";

const run = async () => {
  // ✅ Debug to ensure envs loaded
  console.log("SUPABASE_URL:", "y");
  console.log("SUPABASE_API_KEY:", process.env.SUPABASE_API_KEY);

  const client = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_API_KEY
  );

  const embeddings = new PineconeEmbeddings({
    apiKey: process.env.PINECONE_API_KEY,
    model: "multilingual-e5-large",
  });

  const rawText = await fs.readFile("./custom script.txt", "utf-8");

  // Create the splitter instance with your parameters
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
    separators: ['\n\n', '\n', ' ', ''],
  });

  // Wrap rawText in a Document first
  const initialDoc = new Document({
    pageContent: rawText,
    metadata: {},
  });

  // Split the document into chunks
  const docs = await splitter.splitDocuments([initialDoc]);

  const vectorStore = await SupabaseVectorStore.fromDocuments(docs, embeddings, {
    client,
    tableName: "documents",       // 🔧 Your Supabase vector table name
    queryName: "match_documents", // 🔧 Supabase function name
  });

  console.log("✅ Embeddings stored in Supabase.");
};

run().catch((err) => console.error("❌ Error:", err));
