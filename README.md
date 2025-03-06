# Custom AI Chatbot

Welcome to the **Custom AI Chatbot** project! This chatbot is powered by advanced machine learning techniques and trained on a custom dataset to provide meaningful and context-aware responses. It is designed to interact with users, answer questions, and assist with tasks based on the information it has been trained on.

## Features

- **Custom Responses**: Trained on a custom dataset, allowing the chatbot to provide relevant and personalized responses.
- **Vector Embedding**: Utilizes **Supabase** and **Pinecone** for vector embeddings, enabling fast and accurate retrieval of information.
- **Advanced Model**: Built on the **Llama 70B** model, providing state-of-the-art performance in natural language processing tasks.
- **Real-time Interaction**: Supports dynamic conversation with real-time responses to user queries.

## Tech Stack

- **Frontend**:
  - **HTML**: Provides the structure for the user interface.
  - **CSS**: Styles the chatbot UI to be attractive and responsive.
  - **JavaScript**: Handles user input and interaction logic.

- **Backend**:
  - **LangChain.js**: Manages interactions between the user and the model, processes input, and generates responses.
  - **Supabase**: Stores vector embeddings to facilitate efficient and fast data retrieval.
  - **Pinecone**: Used for creating and managing embeddings, ensuring accurate and context-based responses.

- **Deployment**:
  - **Vercel**: The chatbot is hosted on Vercel, offering scalable and seamless deployment.

## How It Works

1. **User Interaction**: The user types a query into the input field on the chatbot interface.
2. **Query Processing**: The query is processed, and the most relevant data is fetched using vector embeddings from **Supabase** and **Pinecone**.
3. **Response Generation**: The chatbot uses the **Llama 70B model** to generate a response based on the user's query.
4. **Dynamic Response**: The chatbot provides a real-time, context-aware response to the user.

## Example Responses

- **User Query**: "What is the function of the chatbot?"
  - **Chatbot Response**: "The chatbot is designed to assist with tasks, answer questions, and provide helpful responses based on the data it has been trained on."

- **User Query**: "Tell me more about the tech stack used?"
  - **Chatbot Response**: "This chatbot is built using LangChain.js for managing data flow, Supabase and Pinecone for vector embedding, and the Llama 70B model for natural language processing."

## Get Started

1. Visit the deployed version of the chatbot [here](https://chatbot-inky-eight-90.vercel.app/).
2. Type a question or command into the input box and interact with the chatbot.
3. Enjoy a seamless and personalized conversational experience powered by custom data and AI!
