let inputBox = document.getElementById("input-box");
let chatContainer = document.getElementById("messages");
let sendButton = document.getElementById("butn");
let url = "https://chatbot-s54m.vercel.app"; // Replace with your actual API URL

// Function to append a message to the chat
function appendMessage(content, sender = "user") {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");
    if (sender === "user") {
        messageElement.classList.add("user-message");
    } else {
        messageElement.classList.add("bot-message");
    }
    messageElement.textContent = content;
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight; // Auto-scroll to the bottom
}

// Function to get chatbot response
async function getChatbotResponse(question) {
    try {
        const response = await fetch(`${url}/api/LoginFeedback?query=${question}`);
        const data = await response.json();
        return data.response; // Assuming the response object contains the answer
    } catch (error) {
        console.error('Error fetching chatbot response:', error);
        return "Sorry, I couldn't get a response. Please try again.";
    }
}

// Handle send button click
sendButton.addEventListener("click", async () => {
    const userQuestion = inputBox.value.trim();
    if (userQuestion) {
        appendMessage(userQuestion, "user");
        inputBox.value = ""; // Clear the input box

        // Get and display bot response
        const botResponse = await getChatbotResponse(userQuestion);
        appendMessage(botResponse, "bot");
    }
});

// Optional: Handle pressing Enter to send a message
inputBox.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendButton.click();
    }
});
