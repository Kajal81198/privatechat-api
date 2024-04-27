import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please Provide a Username"],
      trim: true,
      minlength: 3
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: "Please Provide valid Email"
      }
    },
    password: {
      type: String,
      minlength: 4,
      trim: true
    },
    picture: {
      type: String,
      minlength: 4,
      trim: true
    },
    verify: {
      type: Number,
      trim: true
    },
    otp: {
      type: Number,
      maxlength: 6
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
