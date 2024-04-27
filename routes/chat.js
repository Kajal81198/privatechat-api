import express from "express";
import { authenticateToken } from "../Config/middleware.js";
import {
  accessChat,
  fetchChats,
  fetchGroups,
  createGroupChat,
  groupExit,
  allSelfToGroup
} from "../controllers/chat.js";
const router = express.Router();

router.post("/access_chat", authenticateToken, accessChat);
router.post("/fetch_chats", authenticateToken, fetchChats);
router.post("/fetch_groups", authenticateToken, fetchGroups);
router.post("/create_group_chat", authenticateToken, createGroupChat);
router.post("/group_exit", authenticateToken, groupExit);
router.post("/add_self_to_group", authenticateToken, allSelfToGroup);

export default router;
