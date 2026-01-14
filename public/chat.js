const API_BASE_URL = "http://localhost:3000";

/* ---------------- AUTH ---------------- */

const token = localStorage.getItem("token");
if (!token) {
  alert("Please login first");
  window.location.href = "login.html";
}

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

const loggedInUser = parseJwt(token);
if (!loggedInUser) {
  alert("Invalid session");
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

const loggedInUserId = loggedInUser.userId;

/* ---------------- SOCKET ---------------- */

const socket = io(API_BASE_URL, {
  auth: { token },
});

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("Socket error:", err.message);
});

/* ---------------- UI ---------------- */

const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const userEmailInput = document.getElementById("userEmailInput");
const joinChatBtn = document.getElementById("joinChatBtn");

/* ---------------- STATE ---------------- */

let currentRoomId = null;
let currentReceiver = null;

/* ---------------- HELPERS ---------------- */

function generateRoomId(userId1, userId2) {
  return [userId1, userId2].sort().join("_");
}

function addMessage(text, user, type, createdAt) {
  const div = document.createElement("div");
  div.classList.add("message", type);

  div.innerHTML = `
    <div class="user">${user}</div>
    <div class="text">${text}</div>
    <div class="time">${new Date(createdAt).toLocaleTimeString([],{
      hour:"2-digit",
      minute:"2-digit",
    })}</div>
  `;

  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

/* ---------------- JOIN ROOM ---------------- */

joinChatBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  const email = userEmailInput.value.trim();
  if (!email) return alert("Enter user email");

  try {
    const res = await axios.get(`${API_BASE_URL}/users/by-email`, {
      params: { email },
      headers: { Authorization: "Bearer " + token },
    });

    const receiver = res.data.user;
    currentReceiver = receiver;

    const roomId = generateRoomId(loggedInUserId, receiver.id);

    if (currentRoomId) {
      socket.emit("leave_room", { roomId: currentRoomId });
    }

    currentRoomId = roomId;
    chatMessages.innerHTML = "";

    socket.emit("join_room", { roomId });

    alert(`Joined room: ${roomId}`);
    console.log("Joined room:", roomId);

    //reset input
    userEmailInput.value = "";

  } catch (err) {
    alert("User not found");
  }
});

/* ---------------- SEND MESSAGE ---------------- */

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!currentRoomId) {
    return alert("Join a chat first");
  }

  const message = messageInput.value.trim();
  if (!message) return;

  messageInput.value = "";

  socket.emit("new_message", {
    roomId: currentRoomId,
    message,
  });
});

/* ---------------- RECEIVE MESSAGE ---------------- */

socket.on("new_message", (msg) => {
  const type =
    msg.sender.id === loggedInUserId ? "sent" : "received";

  addMessage(
    msg.message,
    msg.sender.name,
    type,
    msg.createdAt
  );
});
