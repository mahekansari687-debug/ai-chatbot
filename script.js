const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

function addMessage(message, sender) {
    const messageDiv = document.createElement("div");

    messageDiv.classList.add("message");
    messageDiv.classList.add(
        sender === "user" ? "user-message" : "bot-message"
    );

    messageDiv.textContent = message;
    chatBox.appendChild(messageDiv);

    chatBox.scrollTop = chatBox.scrollHeight;

    return messageDiv;
}

async function sendMessage() {
    const message = userInput.value.trim();

    if (!message || sendBtn.disabled) return;

    addMessage(message, "user");
    userInput.value = "";

    sendBtn.disabled = true;
    sendBtn.textContent = "Sending...";

    const loadingMessage = addMessage("Thinking...", "bot");

    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Something went wrong.");
        }

        loadingMessage.textContent = data.reply;

    } catch (error) {
        loadingMessage.textContent = "Error: " + error.message;
    } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = "Send";
        userInput.focus();
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

sendBtn.addEventListener("click", sendMessage);

userInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        sendMessage();
    }
});