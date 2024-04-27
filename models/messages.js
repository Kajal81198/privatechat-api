import mongoose from "mongoose";

const messagesSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" }
  },
  { timestamps: true }
);

export default mongoose.model("Messages", messagesSchema);
