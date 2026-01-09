const API_BASE_URL = "http://localhost:3000";

//decode logged-in userId from JWT
function parseJwt(token) {
    const base64Payload = token.split(".")[1];
    return JSON.parse(atob(base64Payload));
}

const token = localStorage.getItem("token");

if (!token) {
    alert("Please login first");
    window.location.href = "login.html";
}

const loggedInUser = parseJwt(token);
const loggedInUserId = loggedInUser.userId;

const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");

// Temporary username (later from JWT)
const currentUser = "You";

//ADD MESSAGE
function addMessage(text, user, type, createdAt) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", type);

    const time = new Date(createdAt).toLocaleTimeString([], {
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
chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const message = messageInput.value.trim();
    if (!message) return;

    //Add sent message
    addMessage(message, currentUser, "sent", new Date());
    messageInput.value = "";

    try {
        await axios.post(
            `${API_BASE_URL}/message/send`,
            { message },
            {
                headers: {
                    Authorization: "Bearer " + token,
                },
            }
        )
    } catch (error) {
        console.error("Message send failed");
        alert("Message failed to send");
    }

});

//FETCH MESSAGES
async function fetchMessages() {
    try {
        const response = await axios.get(`${API_BASE_URL}/message`, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });

        const messages = response.data.data;

        chatMessages.innerHTML = ""; //clear old messages

        messages.forEach((msg) => {
            const type = msg.UserId === loggedInUserId ? "sent" : "received";

            addMessage(msg.message, msg.User.name, type, msg.createdAt);

        });

    } catch (error) {
        console.error("Failed to load messages", error);
    }
}

fetchMessages();

