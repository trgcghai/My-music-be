import { StatusCodes } from "http-status-codes";
import {
  authLogin,
  createOtp,
  generateTokens,
  refreshAccessToken,
  verifyAccessToken,
  verifyOtp,
} from "../../services/auth.service.js";
import {
  findAccountByEmail,
  insertAccount,
} from "../../services/account.service.js";
import { sendMail } from "../../services/mail.service.js";
import accountSchema from "../../models/account.model.js";

export const loginHandler = async (req, res) => {
  try {
    const { email, password } = req.body.formData;

    const isValid = await authLogin(email, password);

    if (!isValid) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: "failed",
        code: StatusCodes.BAD_REQUEST,
        message: "Login failed",
      });
    }

    const account = await findAccountByEmail(email);

    if (!account) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: "failed",
        code: StatusCodes.BAD_REQUEST,
        message: "Account not found",
      });
    }

    const { accessToken, refreshToken } = await generateTokens(account);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    return res.status(StatusCodes.OK).send({
      status: "success",
      code: StatusCodes.OK,
      message: "Login successfully",
      data: {
        userInfo: {
          email: account.email,
          username: account.username,
          avatar: account.avatar,
        },
      },
    });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).send({
      status: "failed",
      code: StatusCodes.BAD_REQUEST,
      message: "Login failed",
      error,
    });
  }
};

export const registerHandler = async (req, res) => {
  try {
    const { email, username, password, providerId } = req.body.formData;
    const account = {
      email,
      username,
      password,
      avatar: "",
      providerId,
      createdAt: new Date(),
      lastModified: new Date(),
    };

    if (!accountSchema.validate(account)) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: "failed",
        code: StatusCodes.BAD_REQUEST,
        message: "Invalid account information",
      });
    }

    await insertAccount([account]);
    const { otp } = await createOtp(email);

    await sendMail({
      to: email,
      otp,
      subject: "Validate OTP",
      title: "OTP Verification",
      subTitle: "Your One-Time Password (OTP) is:",
      content: `
            <p>This OTP will expire in 3 minutes. Do not share this code with anyone.</p>
            <p>If you did not request this verification, please ignore this email.</p>
        `,
    });

    return res.status(StatusCodes.OK).send({
      status: "success",
      code: StatusCodes.OK,
      message: "Create account successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.BAD_REQUEST).send({
      status: "failed",
      code: StatusCodes.BAD_REQUEST,
      message: "Failed to create account",
      error,
    });
  }
};

export const resetPasswordHandler = async (req, res) => {
  try {
    const { email } = req.body;
    const { otp } = await createOtp(email);
    await sendMail({
      to: email,
      otp,
      subject: "Reset Password",
      title: "Reset Password",
      subTitle: "We received your password reset request",
      content: `
        <p>This code will be expired in 3 minutes</p>
        <p>If you do not make this request, please ignore this email</p>
    `,
    });
    return res.status(StatusCodes.OK).send({
      status: "success",
      code: StatusCodes.OK,
      message: "Reset password successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.BAD_REQUEST).send({
      status: "failed",
      code: StatusCodes.BAD_REQUEST,
      message: "Failed to reset password",
      error,
    });
  }
};

export const sendOtpHandler = async (req, res) => {
  try {
    const { email } = req.body;
    const { otp } = await createOtp(email);
    await sendMail({
      to: email,
      otp,
      subject: "Validate OTP",
      title: "OTP Verification",
      subTitle: "Your One-Time Password (OTP) is:",
      content: `
        <p>This OTP will expire in 3 minutes. Do not share this code with anyone.</p>
        <p>If you did not request this verification, please ignore this email.</p>
      `,
    });
    return res.status(StatusCodes.OK).send({
      status: "success",
      code: StatusCodes.OK,
      message: "Re-send otp successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.BAD_REQUEST).send({
      status: "failed",
      code: StatusCodes.BAD_REQUEST,
      message: "Failed to re-send otp",
      error,
    });
  }
};

export const verifyOtpHandler = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const isValid = await verifyOtp(email, otp);

    if (!isValid) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: "failed",
        code: StatusCodes.BAD_REQUEST,
        message: "OTP is invalid or expired",
      });
    }

    const account = await findAccountByEmail(email);
    const { accessToken, refreshToken } = await generateTokens(account);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    return res.status(StatusCodes.OK).send({
      status: "success",
      code: StatusCodes.OK,
      message: "Valid OTP, login successfully",
      data: {
        userInfo: {
          email: account.email,
          username: account.username,
          avatar: account.avatar,
        },
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.BAD_REQUEST).send({
      status: "failed",
      code: StatusCodes.BAD_REQUEST,
      message: "Something went wrong",
      error,
    });
  }
};

export const verifyTokenHandler = async (req, res) => {
  try {
    const accessToken = req.cookies.accessToken;
    const result = await verifyAccessToken(accessToken);
    return res.status(StatusCodes.OK).send({
      status: "success",
      code: StatusCodes.OK,
      message: "Token is valid",
      result,
    });
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.UNAUTHORIZED).send({
      status: "failed",
      code: StatusCodes.UNAUTHORIZED,
      message: "Token is invalid or expired",
      error,
    });
  }
};

export const refreshAccessTokenHandler = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(StatusCodes.UNAUTHORIZED).send({
        status: "failed",
        code: StatusCodes.UNAUTHORIZED,
        message: "Refresh token is required",
      });
    }

    const accessToken = await refreshAccessToken(refreshToken);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    return res.status(StatusCodes.OK).send({
      status: "success",
      code: StatusCodes.OK,
      message: "Refresh token successfully",
    });
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).send({
      status: "failed",
      code: StatusCodes.UNAUTHORIZED,
      message: "Refresh token failed",
      error,
    });
  }
};

export const handleLogout = async (req, res) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(StatusCodes.OK).send({
      status: "success",
      code: StatusCodes.OK,
      message: "Logout successfully",
    });
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).send({
      status: "failed",
      code: StatusCodes.UNAUTHORIZED,
      message: "Logout failed",
      error,
    });
  }
};

export const googleLoginHandler = async (req, res) => {
  try {
    const { user } = req.body;
    const { email, displayName, photoURL, providerData } = user;

    let account = await findAccountByEmail(email);

    if (!account) {
      account = {
        email,
        username: displayName,
        avatar: photoURL,
        providerId: providerData[0].providerId,
        createdAt: new Date(),
        lastModified: new Date(),
      };
      if (accountSchema.validate(account)) {
        await insertAccount([account]);
      }
    }

    const { accessToken, refreshToken } = await generateTokens(account);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    return res.status(StatusCodes.OK).send({
      status: "success",
      code: StatusCodes.OK,
      message: "Login successfully",
      data: {
        userInfo: {
          email,
          username: displayName,
          avatar: photoURL,
        },
      },
    });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).send({
      status: "failed",
      code: StatusCodes.BAD_REQUEST,
      message: "Login failed",
      error,
    });
  }
};
