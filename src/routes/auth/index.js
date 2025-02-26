import express from "express";
import {
  googleSigninHandler,
  loginHandler,
  refreshAccessTokenHandler,
  registerHandler,
  resetPasswordHandler,
  sendOtpHandler,
  verifyOtpHandler,
  verifyTokenHandler,
} from "./handlers.js";
import { validateAccountSchema } from "../../middlewares/validateSchema.middleware.js";
import { encryptPassword } from "../../middlewares/preprocessing.middleware.js";

const router = express.Router();

router.post("/login", encryptPassword, loginHandler);

router.post(
  "/register",
  [validateAccountSchema, encryptPassword],
  registerHandler
);

router.post("/reset-password", resetPasswordHandler);

router.post("/send-otp", sendOtpHandler);

router.post("/verify-otp", verifyOtpHandler);

router.get("/verify-token", verifyTokenHandler);

router.post("/refresh-token", refreshAccessTokenHandler);

router.post("/google-signin", googleSigninHandler);

export default router;
