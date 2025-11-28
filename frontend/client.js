const socket = io("http://localhost:3000");

const sendBtn = document.getElementById("sendBtn");
const usernameInput = document.getElementById("username");
const messageInput = document.getElementById("message");
const chatList = document.getElementById("chatList");
const roomButtons = document.querySelectorAll(".roomBtn");

let currentRoom = null;
let username = "";

// Join a room
roomButtons.forEach((btn) => {
  btn.addEventListener("click", async () => {
    username = usernameInput.value;
    if (!username) return alert("Enter username first");

    const newRoom = btn.dataset.room;

    // Leave previous room
    if (currentRoom) {
      socket.emit("leaveRoom", { username, room: currentRoom });
    }

    currentRoom = newRoom;
    chatList.innerHTML = "";

    // Join new room
    socket.emit("joinRoom", { username, room: currentRoom });
  });
});

// Send message
sendBtn.addEventListener("click", () => {
  const message = messageInput.value;
  if (!username || !currentRoom)
    return alert("Select a room and enter username first");

  socket.emit("sendMessage", { username, message, room: currentRoom });
  messageInput.value = "";
});

// Receive new messages
socket.on("newMessage", (chat) => {
  if (chat.room !== currentRoom) return; // Ignore messages from other rooms
  const li = document.createElement("li");
  li.textContent = `${chat.username}: ${chat.message}`;
  chatList.appendChild(li);
});

// Load previous room messages
socket.on("roomMessages", (messages) => {
  chatList.innerHTML = "";
  messages.forEach((chat) => {
    const li = document.createElement("li");
    li.textContent = `${chat.username}: ${chat.message}`;
    chatList.appendChild(li);
  });
});
