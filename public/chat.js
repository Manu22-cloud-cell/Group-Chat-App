const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");

// Temporary username (later from JWT)
const currentUser = "You";

//ADD MESSAGE
function addMessage(text, user, type) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", type);

    const time = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    messageDiv.innerHTML = `
    <div class="user">${user}</div>
    <div class="text">${text}</div>
    <div class="time">${time}</div>
    `;

    chatMessages.appendChild(messageDiv);

    // Auto scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

}

//SEND MESSAGE
chatForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const message = messageInput.value.trim();
    if (!message) return;

    //Add sent message
    addMessage(message, currentUser, "sent");

    messageInput.value = "";

    // Simulate received message (for UI testing)
    setTimeout(() => {
        addMessage("Received: " + message, "Friend", "received");
    }, 1000);
});
