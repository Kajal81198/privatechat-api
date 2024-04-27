import mongoose from "mongoose";
var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;
const chatSchema = new mongoose.Schema(
  {
    chatName: {
      type: String
    },
    isGroupChat: {
      type: Boolean
    },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Messages" },
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export default mongoose.model("Chat", chatSchema);
