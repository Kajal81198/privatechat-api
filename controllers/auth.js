import crypto from "crypto";
import dotenv from "dotenv";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import Chat from "../models/chat.js";
import User from "../models/user.js";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

// Generate access token
function generateAccessToken(user) {
  return jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: "15m"
  });
}

// Generate refresh token
function generateRefreshToken(user) {
  return jwt.sign({ userId: user.id }, JWT_SECRET);
}

function generateHash(inputString) {
  const hash = crypto.createHash("sha256");
  hash.update(inputString);
  return hash.digest("hex");
}

function generateRandomNumber() {
  // Generate a random number between 100000 and 999999 (inclusive)
  return Math.floor(100000 + Math.random() * 900000);
}

const register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.send({ status: false, msg: errors.array()[0].msg });
  const { name, email, password } = req.body;

  try {
    // Check Email Already Register Or Not
    const checkRegister = await User.findOne({ email: email });
    if (checkRegister)
      return res.send({ status: false, msg: "Email already registered" });

    // Hash the password
    const hashedPassword = generateHash(password);

    await User.create({ name: name, email: email, password: hashedPassword });

    return res.send({ status: true, msg: "User register successfully" });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.send({ status: false, msg: errors.array()[0].msg });

  const { email, password } = req.body;

  try {
    const hashedPassword = generateHash(password);

    const user = await User.findOne({
      email: email,
      password: hashedPassword
    }).select({ password: 0 });
    if (!user)
      return res
        .status(200)
        .json({ status: false, msg: "Invalid email or password" });

    if (!user.verify) {
      const OTP = generateRandomNumber();
      await User.findOneAndUpdate(
        { email: email },
        {
          $set: {
            otp: OTP
          }
        }
      );
      return res.status(200).json({
        status: true,
        msg: { username: user.name, otp: OTP }
      });
    }
    const accessToken = generateAccessToken({ id: user._id });
    const refreshToken = generateRefreshToken({ id: user._id });

    res.cookie("access_token", accessToken, { httpOnly: true, secure: true });
    res.cookie("refresh_token", refreshToken, { httpOnly: true, secure: true });
    return res.status(200).json({
      status: true,
      msg: user
    });
  } catch (error) {
    return next(error);
  }
};

const verifyAccount = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.send({ status: false, msg: errors.array()[0].msg });

  const { email, otp } = req.body;

  try {
    const user = await User.findOne({
      email: email,
      otp: Number(otp)
    }).select({ password: 0 });
    if (!user)
      return res
        .status(200)
        .json({ status: false, msg: "Verification code does not match" });

    await User.findOneAndUpdate(
      { email: email },
      {
        $set: {
          verify: 1
        },
        $unset: { otp: 1 }
      }
    );
    const accessToken = generateAccessToken({ id: user._id });
    const refreshToken = generateRefreshToken({ id: user._id });

    res.cookie("access_token", accessToken, { httpOnly: true, secure: true });
    res.cookie("refresh_token", refreshToken, { httpOnly: true, secure: true });
    return res.status(200).json({
      status: true,
      msg: "Successfully login"
    });
  } catch (error) {
    return next(error);
  }
};

const token = async (req, res, next) => {
  const refreshToken = req.cookies["refresh_token"];
  if (refreshToken == null)
    return res.status(401).json({ status: false, msg: "Unauthorized" });

  jwt.verify(refreshToken, JWT_SECRET, (err, user) => {
    if (err)
      return res.status(403).json({ status: false, msg: "Invalid token" });

    const accessToken = generateAccessToken({
      id: user.userId
    });

    res.cookie("access_token", accessToken, { httpOnly: true, secure: true });
    res.status(200).json({ status: true, msg: "Successful" });
  });
};

const fetchUsers = async (req, res, next) => {
  try {
    const getallConnectedUser = await User.find({
      _id: { $ne: req.user._id },
      verify: 1
    }).select({
      password: 0,
      otp: 0
    });
    return res.status(200).json({
      status: true,
      msg: getallConnectedUser
    });
  } catch (error) {
    next(error);
  }
};

const checkUserRegister = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.send({ status: false, msg: errors.array()[0].msg });

  const { email } = req.body;
};

export { register, login, verifyAccount, token, fetchUsers, checkUserRegister };
