import { Router } from "express";
import { ChatGroq } from "@langchain/groq";
import { v4 as uuidv4 } from "uuid";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import {
  START,
  END,
  MessagesAnnotation,
  StateGraph,
  MemorySaver,
  Annotation,
} from "@langchain/langgraph";
import { createClient } from "@supabase/supabase-js";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { PineconeEmbeddings } from "@langchain/pinecone";
import {config} from "dotenv";
config();

const Botroute = Router();

const llm = new ChatGroq({
  model: "llama3-70b-8192",
  temperature: 0.6,
  apiKey: process.env.GROQ_API_KEY,
});

const client = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_API_KEY
);

const embedding = new PineconeEmbeddings({
  model: "multilingual-e5-large",
  apiKey: process.env.PINECONE_API_KEY,
});

const searchDocuments = async (query) => {
  const vectorStore = new SupabaseVectorStore(embedding, {
    client,
    tableName: "documents", // Ensure this matches your actual table name
    queryName: "match_documents", // Ensure this matches your actual query name
  });

  // Use asRetriever method correctly
  const retriever = vectorStore.asRetriever({
    k: 5, // Number of results to return
  });

  const documents = await retriever.invoke(query); // Call retrieve with the query

  return documents;
};

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are a helpful assistant. Answer all questions to the best of your ability in {language}.",
  ],
  new MessagesPlaceholder("messages"),
]);

// Define the State
const GraphAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  language: Annotation,
});

// Define the function that calls the model
const callModel = async (state) => {
  const chain = prompt.pipe(llm);
  const response = await chain.invoke(state);
  return { messages: [response] };
};

const workflow = new StateGraph(GraphAnnotation)
  .addNode("model", callModel)
  .addEdge(START, "model")
  .addEdge("model", END);

// Add memory
const memory = new MemorySaver();

const config3 = { configurable: { thread_id: uuidv4() } };
const app = workflow.compile({ checkpointer: memory });

Botroute.get("/LoginFeedback", async (req, res) => {
    try {
      const userQuery = req.query.query || ""; // Get user query from request
  
      if (!userQuery) {
        return res.status(400).json({ error: "Query parameter is required." });
      }
  
      const callRAGModel = async (userQuery) => {
        try {
          // Step 1: Retrieve context from the vector store
          const documents = await searchDocuments(userQuery);
          const context = documents.map((doc) => doc.pageContent).join("\n");
  
          // Step 2: Combine query and context
          const augmentedQuery = `${userQuery}\n\nContext:\n${context}`;
  
          // Step 3: Generate response using LLM
          const state = {
            messages: [{ role: "user", content: augmentedQuery }],
          };
          const response = await app.invoke(state, config3); // Using your chatbot's compiled workflow
          return response.messages[response.messages.length - 1].content;
        } catch (error) {
          console.error("Error in RAG model:", error);
          return "Sorry, I couldn't retrieve relevant information. Please try again.";
        }
      };
  
      const responseMessage = await callRAGModel(userQuery);
      return res.json({ response: responseMessage });
    } catch (error) {
      console.error("Error in /LoginFeedback route:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  });


  export default Botroute;