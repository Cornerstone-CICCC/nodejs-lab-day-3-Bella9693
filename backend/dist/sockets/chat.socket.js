"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chat_model_1 = require("../models/chat.model");
const setupChatSocket = (io) => {
    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);
        // Join a room
        socket.on("joinRoom", (_a) => __awaiter(void 0, [_a], void 0, function* ({ username, room }) {
            socket.join(room);
            // Notify other users in the room
            socket.to(room).emit("newMessage", {
                username: "System",
                message: `${username} has joined the room`,
                room,
            });
            // Send previous messages of this room to the user who joined
            const messages = yield chat_model_1.Chat.find({ room }).sort({ createdAt: 1 });
            socket.emit("roomMessages", messages);
        }));
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
        socket.on("sendMessage", (_a) => __awaiter(void 0, [_a], void 0, function* ({ username, message, room }) {
            try {
                const chat = new chat_model_1.Chat({ username, message, room });
                yield chat.save();
                // Emit only to the room
                io.to(room).emit("newMessage", chat);
            }
            catch (error) {
                console.error("Error saving chat:", error);
            }
        }));
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
};
exports.default = setupChatSocket;
