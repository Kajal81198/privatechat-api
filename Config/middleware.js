import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import User from "../models/user.js";
const JWT_SECRET = process.env.JWT_SECRET;
// Middleware to authenticate access token
// export function authenticateToken(req, res, next) {
//   const authHeader = req.headers["x-auth"];
//   const token = authHeader && authHeader.split(" ")[1];
//   if (token == null) return res.sendStatus(401);

//   jwt.verify(token, JWT_SECRET, (err, user) => {
//     if (err) return res.sendStatus(403);
//     req.user = user;
//     next();
//   });
// }

export function authenticateToken(req, res, next) {
  const token = req.cookies["access_token"];
  if (token == null) return res.status(401).json({ error: "unauthroized" });

  jwt.verify(token, JWT_SECRET, async (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid_Token" });
    const getUser = await User.findOne({ _id: user.userId }).select({
      password: 0,
      otp: 0,
      verify: 0
    });
    if (!getUser) return res.status(403).json({ error: "Invalid_user" });
    req.user = getUser;
    next();
  });
}
