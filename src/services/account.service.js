import { ObjectId } from "mongodb";
import { getDb } from "../configs/dbConfig.js";

export async function findAllAccount() {
  try {
    const db = getDb();
    const accountColl = await db.collection("accounts");
    return await accountColl.find().toArray();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function findAccountById(id) {
  try {
    const db = getDb();
    const accountColl = await db.collection("accounts");
    return await accountColl.find({ _id: new ObjectId(id) }).toArray();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function findAccountByEmail(email) {
  try {
    const db = getDb();
    const accountColl = await db.collection("accounts");
    return await accountColl.findOne({ email });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function insertAccount(accounts) {
  try {
    const db = getDb();
    const accountColl = await db.collection("accounts");
    return await accountColl.insertMany(accounts);
  } catch (error) {
    console.error(error);
    throw error;
  }
}
