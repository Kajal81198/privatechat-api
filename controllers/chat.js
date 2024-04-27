import crypto from "crypto";
import dotenv from "dotenv";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Chat from "../models/chat.js";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const accessChat = async (req, res, next) => {
  const { userId } = req.body;
  if (!userId) {
    return res
      .status(406)
      .json({ status: false, msg: "Please provide valid userId" });
  }
  try {
    let isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } }
      ]
    })
      .populate("users", "-password")
      .populate("latestMessage");

    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "name email"
    });
    if (isChat.length > 0) {
      return res.status(200).json({ status: true, msg: isChat[0] });
    } else {
      let chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId]
      };
      try {
        const createChat = await Chat.create(chatData);

        const fullChat = await Chat.findOne({ _id: createChat._id }).populate(
          "users",
          "-password"
        );
        return res.status(200).json({ status: true, msg: fullChat });
      } catch (error) {
        next(error);
      }
    }
  } catch (error) {
    next(error);
  }
};

const fetchChats = async (req, res, next) => {
  try {
    let results = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } }
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    results = await User.populate(results, {
      path: "latestMessage.sender",
      select: "name email"
    });

    return res
      .status(200)
      .json({ status: true, msg: { reqUser: req.user._id, results } });
  } catch (error) {
    next(error);
  }
};

const fetchGroups = async (req, res, next) => {
  try {
    let allGroups = await Chat.where("isGroupChat").equals(true);

    return res.status(200).json({ status: true, msg: allGroups });
  } catch (error) {
    next(error);
  }
};

const createGroupChat = async (req, res, next) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).json({ status: true, msg: "Data is insufficient" });
  }
  let users = JSON.parse(req.body.users);
  users.push(req.user._id);
  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user._id
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    return res.status(200).json({ status: true, msg: fullGroupChat });
  } catch (error) {
    next(error);
  }
};

const groupExit = async (req, res, next) => {
  const { chatId, userId } = req.body;
  if (!chatId || !userId) {
    return res.status(400).json({ status: true, msg: "Data is insufficient" });
  }
  try {
    const remove = await Chat.findByIdAndUpdate(
      { _id: chatId },
      { $pull: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    return res.status(200).json({ status: true, msg: remove });
  } catch (error) {
    next(error);
  }
};

const allSelfToGroup = async (req, res, next) => {
  const { chatId, userId } = req.body;
  if (!chatId || !userId) {
    return res.status(400).json({ status: true, msg: "Data is insufficient" });
  }
  try {
    const added = await Chat.findByIdAndUpdate(
      { _id: chatId },
      { $push: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!added) {
      return res.status(400).json({ status: false, msg: "Chat not found" });
    }
    return res.status(200).json({ status: true, msg: added });
  } catch (error) {
    next(error);
  }
};

export {
  accessChat,
  fetchChats,
  fetchGroups,
  createGroupChat,
  groupExit,
  allSelfToGroup
};
