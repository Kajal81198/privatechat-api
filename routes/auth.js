import express from "express";
const router = express.Router();
import {
  register,
  login,
  verifyAccount,
  token,
  fetchUsers,
  checkUserRegister
} from "../controllers/auth.js";
import { body } from "express-validator";
import { authenticateToken } from "../Config/middleware.js";

router.post(
  "/register",
  [
    body("name", "Name has to be valid with minimun length 3.")
      .isLength({ min: 3 })
      .trim(),
    body("email", "email has to be valid").trim().isEmail(),
    body("password", "Password has to be valid with minimun length 5.")
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim()
  ],
  register
);

router.post(
  "/login",
  [
    body("email", "email has to be valid").trim().isEmail(),
    body("password", "Password has to be valid with minimun length 5.")
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim()
  ],
  login
);

router.post(
  "/verify_account",
  [
    body("email", "email has to be valid").trim().isEmail(),
    body("otp", "otp has to be valid with length 6.")
      .isLength({ max: 6 })
      .trim()
  ],
  verifyAccount
);

router.post("/token", token);

router.post("/fetch_users", authenticateToken, fetchUsers);

router.post(
  "/check_user_register",
  [body("email", "email has to be valid").trim().isEmail()],
  authenticateToken,
  checkUserRegister
);

export default router;
