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

/* ---------------- UI ---------------- */

const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const chatStatus = document.getElementById("chatStatus");
const userList = document.getElementById("userList");
const searchUserInput = document.getElementById("searchUserInput");
const chatHeaderTitle = document.getElementById("chatHeaderTitle");
const addMemberBtn = document.getElementById("addMemberBtn");
const addMemberModal = document.getElementById("addMemberModal");
const memberUserList = document.getElementById("memberUserList");
const closeModalBtn = document.getElementById("closeModalBtn");


/* ---------------- STATE ---------------- */

let currentRoomId = null;      // personal chat
let currentReceiver = null;

let currentGroupId = null;     // group chat

let allUsers = [];
let recentChats = new Map();   // personal chat history (in-memory)
let groups = [];

/* ---------------- HELPERS ---------------- */

function generateRoomId(userId1, userId2) {
  return [userId1, userId2].sort().join("_");
}

function addMessage(text, user, type, createdAt, showSender = true) {
  const div = document.createElement("div");
  div.classList.add("message", type);

  div.innerHTML = `
    ${showSender ? `<div class="user">${user}</div>` : ""}
    <div class="text">${text}</div>
    <div class="time">
      ${new Date(createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}
    </div>
  `;

  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}


/* ---------------- USERS ---------------- */

async function fetchUsers() {
  try {
    const res = await axios.get(`${API_BASE_URL}/users`, {
      headers: { Authorization: "Bearer " + token },
    });

    allUsers = res.data.users;

    // default: show recent chats only
    renderUserList([...recentChats.values()]);
  } catch (err) {
    console.error("Failed to fetch users", err);
  }
}

function renderUserList(users) {
  userList.innerHTML = "";

  users.forEach((user) => {
    const div = document.createElement("div");
    div.classList.add("user-item");

    if (currentReceiver && currentReceiver.id === user.id) {
      div.classList.add("active");
    }

    div.innerHTML = `
      <div class="user-name">${user.name}</div>
      <div class="user-email">${user.email || ""}</div>
    `;

    div.onclick = () => joinPersonalChat(user);
    userList.appendChild(div);
  });
}

/* ---------------- GROUPS ---------------- */

async function fetchGroups() {
  try {
    const res = await axios.get(`${API_BASE_URL}/groups`, {
      headers: { Authorization: "Bearer " + token },
    });

    groups = res.data.groups;
    renderGroupList(groups);
  } catch (err) {
    console.error("Failed to fetch groups", err);
  }
}

function renderGroupList(groups) {
  const groupSection = document.getElementById("groupList");
  if (!groupSection) return;

  groupSection.innerHTML = "";

  groups.forEach((group) => {
    const div = document.createElement("div");
    div.classList.add("user-item");
    div.textContent = group.name;

    div.onclick = () => joinGroup(group);
    groupSection.appendChild(div);
  });
}

function joinGroup(group) {
  if (currentGroupId) {
    socket.emit("leave_group", { groupId: currentGroupId });
  }

  currentGroupId = group.id;
  currentRoomId = null;
  currentReceiver = null;

  chatHeaderTitle.textContent = group.name;

  //HIDE status for group chat
  chatStatus.classList.add("hidden");

  chatMessages.innerHTML = "";
  addMemberBtn.classList.remove("hidden");

  socket.emit("join_group", { groupId: group.id });
}


addMemberBtn.onclick = async () => {
  addMemberModal.classList.remove("hidden");
  loadUsersForGroup();
};

closeModalBtn.onclick = () => {
  addMemberModal.classList.add("hidden");
};

async function loadUsersForGroup() {
  try {
    memberUserList.innerHTML = "";

    // 1. Get group details
    const groupRes = await axios.get(
      `${API_BASE_URL}/groups/${currentGroupId}`,
      { headers: { Authorization: "Bearer " + token } }
    );

    const groupMembers = groupRes.data.group.Users.map(u => u.id);

    // 2. Get all users
    const usersRes = await axios.get(`${API_BASE_URL}/users`, {
      headers: { Authorization: "Bearer " + token }
    });

    usersRes.data.users.forEach(user => {
      if (
        user.id === loggedInUserId ||
        groupMembers.includes(user.id)
      ) return;

      const div = document.createElement("div");
      div.className = "user-item";
      div.textContent = user.name;

      div.onclick = () => addUserToGroup(user.id);
      memberUserList.appendChild(div);
    });

  } catch (err) {
    console.error(err);
    alert("Failed to load users for group");
  }
}



async function addUserToGroup(userId) {
  try {
    await axios.post(
      `${API_BASE_URL}/groups/add-member`,
      {
        groupId: currentGroupId,
        userIdToAdd: userId
      },
      {
        headers: { Authorization: "Bearer " + token }
      }
    );

    alert("User added to group");
    addMemberModal.classList.add("hidden");

  } catch (err) {
    alert(err.response?.data?.message || "Failed to add user");
  }
}



/* ---------------- SEARCH ---------------- */

searchUserInput.addEventListener("input", (e) => {
  const value = e.target.value.toLowerCase();

  if (!value) {
    renderUserList([...recentChats.values()]);
    return;
  }

  const filtered = allUsers.filter((user) =>
    user.email.toLowerCase().includes(value)
  );

  renderUserList(filtered);
});

/* ---------------- PERSONAL CHAT ---------------- */

function joinPersonalChat(user) {
  addMemberBtn.classList.add("hidden");
  if (user.id === loggedInUserId) return;
  if (currentReceiver && currentReceiver.id === user.id) return;

  if (currentRoomId) {
    socket.emit("leave_room", { roomId: currentRoomId });
  }

  currentReceiver = user;
  currentRoomId = generateRoomId(loggedInUserId, user.id);
  currentGroupId = null;

  chatHeaderTitle.textContent = user.name;
  chatStatus.classList.remove("hidden");
  chatStatus.textContent = `Chatting with ${user.name}`;
  chatStatus.classList.add("active");



  chatMessages.innerHTML = "";

  socket.emit("join_room", { roomId: currentRoomId });

  recentChats.set(user.id, user);
  renderUserList([...recentChats.values()]);
}

/* ---------------- SEND MESSAGE ---------------- */

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const message = messageInput.value.trim();
  if (!message) return;

  messageInput.value = "";

  // GROUP MESSAGE
  if (currentGroupId) {
    socket.emit("group_message", {
      groupId: currentGroupId,
      message,
    });
    return;
  }

  // PERSONAL MESSAGE
  if (!currentRoomId) {
    return alert("Select a user or group to chat");
  }

  socket.emit("new_message", {
    roomId: currentRoomId,
    message,
  });
});

/* ---------------- RECEIVE PERSONAL MESSAGE ---------------- */

socket.on("new_message", (msg) => {
  const isOwnMessage = msg.sender.id === loggedInUserId;

  addMessage(
    msg.message,
    msg.sender.name,
    isOwnMessage ? "sent" : "received",
    msg.createdAt
  );

  if (!isOwnMessage && !recentChats.has(msg.sender.id)) {
    recentChats.set(msg.sender.id, {
      id: msg.sender.id,
      name: msg.sender.name,
      email: "",
    });

    renderUserList([...recentChats.values()]);
  }
});

/* ---------------- RECEIVE GROUP MESSAGE ---------------- */

socket.on("group_message", (msg) => {
  const isOwnMessage = msg.sender.userId === loggedInUserId;

  addMessage(
    msg.message,
    msg.sender.name,
    isOwnMessage ? "sent" : "received",
    msg.createdAt,
    !isOwnMessage
  );
});


/* ---------------- INIT ---------------- */

fetchUsers();
fetchGroups();
