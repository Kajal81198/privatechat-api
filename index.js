import express from "express";
import dotenv from "dotenv";
const app = express();
import { createServer } from "http";
import cors from "cors";
import AuthRoute from "./routes/auth.js";
import ChatRoute from "./routes/chat.js";
import MessageRoute from "./routes/message.js";

import { ConnectDb } from "./Config/db.js";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";

const server = createServer(app);

dotenv.config();
const PORT = process.env.PORT || 4000;
ConnectDb();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(cookieParser());

app.use("/api", AuthRoute);
app.use("/api/chat", ChatRoute);
app.use("/api/message", MessageRoute);

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ error: "Invalid JSON" });
  }
  console.log(error);
  return res.status(405).json({ error: error.message });
});

server.listen(PORT, () => console.log("Server is running on port", PORT));

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000
});

io.on("connection", socket => {
  socket.on("setup", user => {
    socket.join(user.data._id);
    console.log("first");
    socket.emit("connection");
  });
  socket.on("join_room", room => {
    console.log(room);
    socket.join(room); // Join the user to a socket room
  });
  // We can write our socket event listeners in here...

  socket.on("new_msg", newMsgStatus => {
    var chat = newMsgStatus.chat;
    if (!chat?.users) {
      return console.log("chat.users not define");
    }
    chat.users.forEach(user => {
      if (user._id == newMsgStatus.sender._id) return;

      socket.in(user._id).emit("message received", newMsgStatus);
    });
  });
});
