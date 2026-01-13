const API_BASE_URL = "http://localhost:3000";

/* ---------------- AUTH ---------------- */

const token = localStorage.getItem("token");
if (!token) {
  alert("Please login first");
  window.location.href = "login.html";
}

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

/* ---------------- SOCKET ---------------- */

const socket = io(API_BASE_URL, {
  auth: { token }, // RAW JWT
});

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);

  // JOIN PERSONAL ROOM
  socket.emit("join_room", {
    userId: loggedInUserId,
  });
});

socket.on("connect_error", (err) => {
  console.error("Socket connection error:", err.message);
});

/* ---------------- UI ---------------- */

const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");

/* ---------------- HELPERS ---------------- */

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

/* ---------------- PERSONAL MESSAGE SEND ---------------- */

function sendPersonalMessage(receiverId, message) {
  socket.emit("new_message", {
    receiverId,
    message,
  });
}

/* ---------------- FORM SUBMIT ---------------- */

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = messageInput.value.trim();
  if (!message) return;

  messageInput.value = "";

  /**
   * TEMP:
   * Replace `2` with selected userId later
   */
  const receiverId = 2;

  // SEND VIA SOCKET (PERSONAL)
  sendPersonalMessage(receiverId, message);

  /**
   * Keep HTTP for now (group / DB)
   * Mentor will refactor later
   */
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
  }
});

/* ---------------- FETCH OLD GROUP MESSAGES ---------------- */

async function fetchMessages() {
  try {
    const response = await axios.get(`${API_BASE_URL}/message`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    chatMessages.innerHTML = "";

    response.data.data.forEach((msg) => {
      const type = msg.UserId === loggedInUserId ? "sent" : "received";
      addMessage(msg.message, msg.User.name, type, msg.createdAt);
    });
  } catch (error) {
    console.error("Failed to load messages", error);
  }
}

fetchMessages();

/* ---------------- SOCKET LISTENERS ---------------- */

// GROUP CHAT (existing)
socket.on("newMessage", (msg) => {
  const type = msg.UserId === loggedInUserId ? "sent" : "received";
  addMessage(msg.message, msg.User.name, type, msg.createdAt);
});

// PERSONAL CHAT (new)
socket.on("personal_message", (msg) => {
  const type = msg.sender.id === loggedInUserId ? "sent" : "received";

  addMessage(
    msg.message,
    msg.sender.name,
    type,
    msg.createdAt
  );
});
