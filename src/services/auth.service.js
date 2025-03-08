/* eslint-disable no-undef */
import {findAccountByEmail} from "./account.service.js";
import {authenticator} from "otplib";
import {getDb} from "../configs/dbConfig.js";
import pkg from "crypto-js";
import jwt from "jsonwebtoken";
import {ObjectId} from "mongodb";

const { SHA256 } = pkg;

export async function createOtp(email) {
  try {
    const account = await findAccountByEmail(email);
    if (!account) return;

    const secret = account._id.toString();
    const otp = authenticator.generate(secret);
    const expiresAt = Date.now() + 60 * 3000;
    const hash = SHA256(email + otp + expiresAt.toString()).toString();

    const db = getDb();
    const otpColl = await db.collection("otp_histories");
    const result = await otpColl.insertOne({
      account_id: account._id,
      hash,
      expiresAt,
    });

    return { result, otp };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function verifyOtp(email, otp) {
  try {
    const account = await findAccountByEmail(email);
    if (!account) return;

    const db = getDb();
    const otpColl = await db.collection("otp_histories");
    const result = await otpColl
      .find({ account_id: new ObjectId(account._id) }, { sort: { _id: -1 } })
      .limit(1)
      .next();

    if (Date.now() > result.expiresAt) {
      return false;
    }
    const hash = SHA256(email + otp + result.expiresAt.toString()).toString();

    return hash === result.hash;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function authLogin(email, password) {
  try {
    const account = await findAccountByEmail(email);
    if (!account) return;

    return account.password === password;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function generateTokens(account) {
  const accessToken = jwt.sign(
    {
      email: account.email,
      username: account.username,
    },
    process.env.ACCESS_SECRET,
    { expiresIn: "30m" }
  );
  const refreshToken = jwt.sign(
    {
      email: account.email,
      username: account.username,
    },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
}

export async function verifyAccessToken(token) {
  try {
    return jwt.verify(token, process.env.ACCESS_SECRET);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, process.env.REFRESH_SECRET);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function refreshAccessToken(refreshToken) {
  try {
    const account = await verifyRefreshToken(refreshToken);
    return jwt.sign(
        {
          email: account.email,
          username: account.username,
        },
        process.env.ACCESS_SECRET,
        {expiresIn: "30m"}
    );
  } catch (error) {
    console.error(error);
    throw error;
  }
}
