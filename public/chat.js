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

/* ---------------- UI ---------------- */

const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const chatStatus = document.getElementById("chatStatus");
const userList = document.getElementById("userList");
const searchUserInput = document.getElementById("searchUserInput");
const createGroupBtn = document.getElementById("createGroupBtn");
const chatHeaderTitle = document.getElementById("chatHeaderTitle");
const addMemberBtn = document.getElementById("addMemberBtn");
const addMemberModal = document.getElementById("addMemberModal");
const memberUserList = document.getElementById("memberUserList");
const closeModalBtn = document.getElementById("closeModalBtn");
const memberSearchInput = document.getElementById("memberSearchInput");
const mediaInput = document.getElementById("mediaInput");

/* -------- MEDIA INPUT UX -------- */
mediaInput.addEventListener("change", () => {
  if (mediaInput.files.length > 0) {
    messageInput.placeholder = mediaInput.files[0].name;
  } else {
    messageInput.placeholder = "Type a message...";
  }
});

/* ---------------- STATE ---------------- */

let currentRoomId = null;
let currentReceiver = null;
let currentGroupId = null;

let allUsers = [];
let recentChats = new Map();
let groups = [];
let availableGroupUsers = [];

let oldestMessageTime = null;
let hasMoreMessages = true;
let isLoadingOlderMessages = false;


/* ---------------- HELPERS ---------------- */

function generatePrivateRoomId(id1, id2) {
  const ids = [id1, id2].sort((a, b) => a - b);
  return `private_${ids[0]}_${ids[1]}`;
}

function addMessage(
  message,
  user,
  type,
  createdAt,
  showSender = true,
  mediaUrl = null,
  mediaType = null,
  prepend = false
) {
  const div = document.createElement("div");
  div.classList.add("message", type);

  let content = "";

  if (mediaUrl && mediaType) {
    if (mediaType.startsWith("image/")) {
      content = `<img src="${mediaUrl}" class="chat-media" />`;
    } else if (mediaType.startsWith("video/")) {
      content = `
        <video controls class="chat-media">
          <source src="${mediaUrl}" type="${mediaType}" />
        </video>`;
    } else {
      content = `<a href="${mediaUrl}" target="_blank">📎 Download file</a>`;
    }
  }

  if (message) {
    content += `<div class="text">${message}</div>`;
  }

  div.innerHTML = `
    ${showSender ? `<div class="user">${user}</div>` : ""}
    ${content}
    <div class="time">
      ${new Date(createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}
    </div>
  `;

  if (prepend) {
    chatMessages.prepend(div);
  } else {
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

/* ---------------- USERS ---------------- */

async function fetchUsers() {
  const res = await axios.get(`${API_BASE_URL}/users`, {
    headers: { Authorization: "Bearer " + token },
  });

  allUsers = res.data.users;
  renderUserList(allUsers.filter(u => u.id !== loggedInUserId));
}

function renderUserList(users) {
  userList.innerHTML = "";

  users.forEach(user => {
    const div = document.createElement("div");
    div.className = "user-item";
    div.innerHTML = `
      <div class="user-name">${user.name}</div>
      <div class="user-email">${user.email || ""}</div>
    `;
    div.onclick = () => joinPersonalChat(user);
    userList.appendChild(div);
  });
}

/* ---------------- SEARCH USERS ---------------- */

searchUserInput.addEventListener("input", e => {
  const value = e.target.value.toLowerCase().trim();

  if (!value) {
    renderUserList(allUsers.filter(u => u.id !== loggedInUserId));
    return;
  }

  const filtered = allUsers.filter(
    u =>
      u.id !== loggedInUserId &&
      u.email &&
      u.email.toLowerCase().includes(value)
  );

  renderUserList(filtered);
});

/* ---------------- GROUPS ---------------- */

createGroupBtn.addEventListener("click", async () => {
  const groupName = prompt("Enter group name:");

  if (!groupName || !groupName.trim()) {
    return alert("Group name cannot be empty");
  }

  try {
    const res = await axios.post(
      `${API_BASE_URL}/groups/create`,
      { name: groupName.trim() },
      { headers: { Authorization: "Bearer " + token } }
    );

    const newGroup = res.data.group;

    // Add group to local state
    groups.push(newGroup);

    // Re-render groups
    renderGroupList(groups);

    // Auto open the newly created group
    joinGroup(newGroup);

  } catch (err) {
    console.error("Create group failed", err);
    alert(err.response?.data?.message || "Failed to create group");
  }
});


async function fetchGroups() {
  const res = await axios.get(`${API_BASE_URL}/groups`, {
    headers: { Authorization: "Bearer " + token },
  });

  groups = res.data.groups;
  renderGroupList(groups);
}

function renderGroupList(groups) {
  const groupSection = document.getElementById("groupList");
  groupSection.innerHTML = "";

  groups.forEach(group => {
    const div = document.createElement("div");
    div.className = "user-item";
    div.textContent = group.name;
    div.onclick = () => joinGroup(group);
    groupSection.appendChild(div);
  });
}

/* ---------------- GROUP MEMBER INFO ---------------- */

async function getGroupMemberInfo(groupId) {
  const res = await axios.get(`${API_BASE_URL}/groups/${groupId}`, {
    headers: { Authorization: "Bearer " + token },
  });

  const users = res.data.group.Users;

  return {
    memberIds: users.map(u => u.id),
    isAdmin: users.some(
      u => u.id === loggedInUserId && u.GroupMember?.isAdmin
    ),
  };
}

/* ---------------- ADD MEMBER ---------------- */

addMemberBtn.addEventListener("click", async () => {
  if (!currentGroupId) return;

  memberUserList.innerHTML = "";
  memberSearchInput.value = "";
  memberSearchInput.disabled = false;

  const { memberIds } = await getGroupMemberInfo(currentGroupId);

  availableGroupUsers = allUsers.filter(
    u => u.id !== loggedInUserId && !memberIds.includes(u.id)
  );

  if (availableGroupUsers.length === 0) {
    memberUserList.innerHTML = "<p>No users to add</p>";
    memberSearchInput.disabled = true;
  } else {
    renderMemberUserList(availableGroupUsers);
  }

  addMemberModal.classList.remove("hidden");
});

function renderMemberUserList(users) {
  memberUserList.innerHTML = "";

  users.forEach(user => {
    const div = document.createElement("div");
    div.className = "user-item";
    div.innerHTML = `
      <div class="user-name">${user.name}</div>
      <div class="user-email">${user.email}</div>
    `;

    div.onclick = async () => {
      await axios.post(
        `${API_BASE_URL}/groups/add-member`,
        { groupId: currentGroupId, userIdToAdd: user.id },
        { headers: { Authorization: "Bearer " + token } }
      );

      availableGroupUsers = availableGroupUsers.filter(u => u.id !== user.id);
      renderMemberUserList(availableGroupUsers);

      if (availableGroupUsers.length === 0) {
        memberUserList.innerHTML = "<p>No users to add</p>";
        memberSearchInput.disabled = true;
      }
    };

    memberUserList.appendChild(div);
  });
}

memberSearchInput.addEventListener("input", e => {
  const value = e.target.value.toLowerCase();

  const filtered = availableGroupUsers.filter(
    u =>
      u.name.toLowerCase().includes(value) ||
      (u.email && u.email.toLowerCase().includes(value))
  );

  if (filtered.length === 0) {
    memberUserList.innerHTML = "<p>No matching users</p>";
    return;
  }

  renderMemberUserList(filtered);
});

closeModalBtn.addEventListener("click", () => {
  addMemberModal.classList.add("hidden");
  memberSearchInput.value = "";
  memberSearchInput.disabled = false;
});

/* ---------------- JOIN GROUP ---------------- */

async function joinGroup(group) {
  leaveCurrentChat();

  currentGroupId = group.id;
  chatHeaderTitle.textContent = group.name;
  chatStatus.classList.add("hidden");

  const { isAdmin } = await getGroupMemberInfo(group.id);
  addMemberBtn.classList.toggle("hidden", !isAdmin);

  await loadGroupMessages(group.id);
  socket.emit("join_group", { groupId: group.id });
}

/* ---------------- PERSONAL CHAT ---------------- */

async function joinPersonalChat(user) {
  leaveCurrentChat();

  currentReceiver = user;
  currentRoomId = generatePrivateRoomId(loggedInUserId, user.id);

  chatHeaderTitle.textContent = user.name;
  chatStatus.textContent = `Chatting with ${user.name}`;
  chatStatus.classList.remove("hidden");
  chatStatus.classList.add("active");
  addMemberBtn.classList.add("hidden");

  await loadPrivateMessages(user.id);
  socket.emit("join_private", { roomId: currentRoomId });

  recentChats.set(user.id, user);
  renderUserList([...recentChats.values()]);
}

function leaveCurrentChat() {
  if (currentRoomId) socket.emit("leave_private", { roomId: currentRoomId });
  if (currentGroupId) socket.emit("leave_group", { groupId: currentGroupId });

  currentRoomId = null;
  currentReceiver = null;
  currentGroupId = null;

  oldestMessageTime = null;
  hasMoreMessages = true;
  isLoadingOlderMessages = false;

  chatMessages.innerHTML = "";
  chatStatus.textContent = "Not chatting with anyone";
  chatStatus.classList.remove("hidden");
  addMemberModal.classList.add("hidden");
}


// UPLOAD MEDIA FUNCTION

async function uploadMedia(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post(
    `${API_BASE_URL}/media/upload`,
    formData,
    {
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "multipart/form-data"
      }
    }
  );

  return res.data; // { url, type }
}

/* ---------------- SEND MESSAGE ---------------- */

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!currentGroupId && !currentRoomId) return;

  const message = messageInput.value.trim();
  const file = mediaInput.files[0];
  if (!message && !file) return;

  const now = new Date().toISOString();
  let mediaUrl = null;
  let mediaType = null;

  if (file) {
    const uploadRes = await uploadMedia(file);
    mediaUrl = uploadRes.url;
    mediaType = uploadRes.type;

    addMessage(null, "You", "sent", now, false, mediaUrl, mediaType);
    mediaInput.value = "";
  }

  if (currentGroupId) {
    socket.emit("send_group_message", {
      groupId: currentGroupId,
      message: message || null,
      mediaUrl,
      mediaType,
    });
  } else {
    socket.emit("send_private_message", {
      roomId: currentRoomId,
      receiverId: currentReceiver.id,
      message: message || null,
      mediaUrl,
      mediaType,
    });
  }

  if (message) {
    addMessage(message, "You", "sent", now, false);
  }

  messageInput.value = "";
  messageInput.placeholder = "Type a message...";
});

/* ---------------- LOAD HISTORY ---------------- */

async function loadPrivateMessages(userId) {
  const res = await axios.get(
    `${API_BASE_URL}/messages/private/${userId}`,
    { headers: { Authorization: "Bearer " + token } }
  );

  chatMessages.innerHTML = "";
  hasMoreMessages = true;

  const messages = res.data.messages;

  messages.forEach(msg => {
    addMessage(
      msg.message,
      msg.Sender.name,
      msg.senderId === loggedInUserId ? "sent" : "received",
      msg.createdAt,
      true,
      msg.mediaUrl,
      msg.mediaType
    );
  });

  if (messages.length > 0) {
    oldestMessageTime = messages[0].createdAt;
  }
}

async function loadGroupMessages(groupId) {
  const res = await axios.get(
    `${API_BASE_URL}/messages/group/${groupId}`,
    { headers: { Authorization: "Bearer " + token } }
  );

  chatMessages.innerHTML = "";
  hasMoreMessages = true;

  const messages = res.data.messages;

  messages.forEach(msg => {
    addMessage(
      msg.message,
      msg.User.name,
      msg.senderId === loggedInUserId ? "sent" : "received",
      msg.createdAt,
      true,
      msg.mediaUrl,
      msg.mediaType
    );
  });

  if (messages.length > 0) {
    oldestMessageTime = messages[0].createdAt;
  }
}

async function loadOlderPrivateMessages() {
  if (!hasMoreMessages || isLoadingOlderMessages || !oldestMessageTime) return;

  isLoadingOlderMessages = true;

  const res = await axios.get(
    `${API_BASE_URL}/messages/private/${currentReceiver.id}/older`,
    {
      headers: { Authorization: "Bearer " + token },
      params: { before: oldestMessageTime }
    }
  );

  const messages = res.data.messages;

  messages.forEach(msg => {
    addMessage(
      msg.message,
      msg.Sender?.name || "Unknown",
      msg.senderId === loggedInUserId ? "sent" : "received",
      msg.createdAt,
      true,
      msg.mediaUrl,
      msg.mediaType,
      true // PREPEND
    );
  });

  if (messages.length > 0) {
    oldestMessageTime = messages[0].createdAt;
  }

  hasMoreMessages = res.data.hasMore;
  isLoadingOlderMessages = false;
}

async function loadOlderGroupMessages() {
  if (!hasMoreMessages || isLoadingOlderMessages || !oldestMessageTime) return;

  isLoadingOlderMessages = true;

  const res = await axios.get(
    `${API_BASE_URL}/messages/group/${currentGroupId}/older`,
    {
      headers: { Authorization: "Bearer " + token },
      params: { before: oldestMessageTime }
    }
  );

  const messages = res.data.messages;

  messages.forEach(msg => {
    addMessage(
      msg.message,
      msg.User?.name || "Unknown",
      msg.senderId === loggedInUserId ? "sent" : "received",
      msg.createdAt,
      true,
      msg.mediaUrl,
      msg.mediaType,
      true
    );
  });

  if (messages.length > 0) {
    oldestMessageTime = messages[0].createdAt;
  }

  hasMoreMessages = res.data.hasMore;
  isLoadingOlderMessages = false;
}


// Scroll listener(inifinite scroll)

chatMessages.addEventListener("scroll", () => {
  if (chatMessages.scrollTop === 0) {
    if (currentGroupId) {
      loadOlderGroupMessages();
    } else if (currentReceiver) {
      loadOlderPrivateMessages();
    }
  }
});

/* ---------------- SOCKET RECEIVE ---------------- */

socket.on("private_message", msg => {
  if (msg.roomId === currentRoomId) {
    addMessage(
      msg.message,
      msg.senderName,
      "received",
      msg.createdAt,
      true,
      msg.mediaUrl,
      msg.mediaType
    );
  }
});

socket.on("group_message", msg => {
  if (msg.groupId === currentGroupId) {
    addMessage(
      msg.message,
      msg.senderName,
      "received",
      msg.createdAt,
      true,
      msg.mediaUrl,
      msg.mediaType
    );
  }
});

/* ---------------- INIT ---------------- */

fetchUsers();
fetchGroups();