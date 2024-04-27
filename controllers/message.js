import dotenv from "dotenv";
import Chat from "../models/chat.js";
import Messages from "../models/messages.js";
import User from "../models/user.js";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const allMessages = async (req, res, next) => {
  const { chatId } = req.params;
  if (!chatId) {
    return res
      .status(406)
      .json({ status: false, msg: "Please provide valid userId" });
  }
  try {
    let messages = await Messages.find({
      chat: chatId
    })
      .populate("sender", "name email")
      .populate("receiver")
      .populate("chat");

    return res.status(200).json({ status: true, msg: messages });
  } catch (error) {
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  const { content, chatId } = req.body;
  if (!content || !chatId) {
    return res
      .status(406)
      .json({ status: false, msg: "Please provide valid userId" });
  }
  try {
    let newMessage = { sender: req.user._id, content: content, chat: chatId };

    let message = await Messages.create(newMessage);

    message = await message.populate("sender", "name");
    message = await message.populate("chat");
    message = await message.populate("receiver");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name email"
    });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });
    return res.status(200).json({ status: true, msg: message });
  } catch (error) {
    next(error);
  }
};

export { allMessages, sendMessage };
