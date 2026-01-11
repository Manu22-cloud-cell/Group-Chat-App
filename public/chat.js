const API_BASE_URL = "http://localhost:3000";

const token = localStorage.getItem("token");
if (!token) {
  alert("Please login first");
  window.location.href = "login.html";
}

// decode JWT safely
function parseJwt(token) {
  try {
    const base64Payload = token.split(".")[1];
    return JSON.parse(atob(base64Payload));
  } catch {
    return null;
  }
}

const loggedInUser = parseJwt(token);
if (!loggedInUser) {
  alert("Invalid session, please login again");
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

const loggedInUserId = loggedInUser.userId;

// socket connection (with token)
const socket = io(API_BASE_URL, {
  auth: { token },
});

const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");

// ADD MESSAGE
function addMessage(text, user, type, createdAt) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", type);

  const time = new Date(createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  messageDiv.innerHTML = `
    <div class="user">${user}</div>
    <div class="text">${text}</div>
    <div class="time">${time}</div>
  `;

  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// SEND MESSAGE (NO UI UPDATE HERE)
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = messageInput.value.trim();
  if (!message) return;

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
    );
  } catch (error) {
    console.error("Message send failed", error);
    alert("Message failed to send");
  }
});

// FETCH OLD MESSAGES
async function fetchMessages() {
  try {
    const response = await axios.get(`${API_BASE_URL}/message`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    const messages = response.data.data;
    chatMessages.innerHTML = "";

    messages.forEach((msg) => {
      const type = msg.UserId === loggedInUserId ? "sent" : "received";
      addMessage(msg.message, msg.User.name, type, msg.createdAt);
    });
  } catch (error) {
    console.error("Failed to load messages", error);
  }
}

fetchMessages();

// LIVE MESSAGE FROM SOCKET
socket.on("newMessage", (msg) => {
  const type = msg.UserId === loggedInUserId ? "sent" : "received";
  addMessage(msg.message, msg.User.name, type, msg.createdAt);
});
