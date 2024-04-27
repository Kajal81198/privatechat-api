import express from "express";
import { authenticateToken } from "../Config/middleware.js";
import { allMessages, sendMessage } from "../controllers/message.js";
const router = express.Router();

router.post("/:chatId", authenticateToken, allMessages);
router.post("/", authenticateToken, sendMessage);

export default router;
