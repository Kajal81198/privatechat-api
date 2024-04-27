import mongoose from "mongoose";
const ConnectDb = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/private-chat-db", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.log(error);
  }
};
export { ConnectDb };
