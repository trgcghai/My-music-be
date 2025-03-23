import {findAccountByEmail} from "./account.service.js";
import {authenticator} from "otplib";
import {getDb} from "../configs/dbConfig.js";
import pkg from "crypto-js";
import {ObjectId} from "mongodb";
import redis from "../configs/redis.js";
const { SHA256 } = pkg;

const OTP_EXPIRATION = 300;

export async function createOtp(email) {
    try {
        const account = await findAccountByEmail(email);
        if (!account) return;

        const secret = account._id.toString();
        const otp = authenticator.generate(secret);
        const hash = SHA256(email + otp).toString();

        await redis.setex(`otp:${email}`, OTP_EXPIRATION, hash);

        return {otp};
    } catch (error) {
        console.error(error);
        throw error;
    }
}


export async function verifyOtp(email, otp) {
    try {
        const account = await findAccountByEmail(email);
        if (!account) return;

        const storeHash = await redis.get(`otp:${email}`);

        if (!storeHash) return false;

        const hash = SHA256(email + otp).toString();

        if (hash === storeHash) {
            await redis.del(`otp:${email}`);
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}
