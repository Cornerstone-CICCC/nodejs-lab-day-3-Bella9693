import { Server, Socket } from "socket.io";
import { Chat } from "../models/chat.model";

const setupChatSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a room
    socket.on("joinRoom", async ({ username, room }) => {
      socket.join(room);

      // Notify other users in the room
      socket.to(room).emit("newMessage", {
        username: "System",
        message: `${username} has joined the room`,
        room,
      });

      // Send previous messages of this room to the user who joined
      const messages = await Chat.find({ room }).sort({ createdAt: 1 });
      socket.emit("roomMessages", messages);
    });

    // Leave a room
    socket.on("leaveRoom", ({ username, room }) => {
      socket.leave(room);

      // Notify other users in the room
      socket.to(room).emit("newMessage", {
        username: "System",
        message: `${username} has left the room`,
        room,
      });
    });

    // Send message
    socket.on("sendMessage", async ({ username, message, room }) => {
      try {
        const chat = new Chat({ username, message, room });
        await chat.save();

        // Emit only to the room
        io.to(room).emit("newMessage", chat);
      } catch (error) {
        console.error("Error saving chat:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

export default setupChatSocket;
