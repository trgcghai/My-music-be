/* eslint-disable no-undef */
import { MongoClient } from "mongodb";

let db = null;
let client = null;

const uri = "mongodb://localhost:27017";
const dbName = "myMusic";

export async function connectToDatabase() {
  try {
    if (db && client) {
      return { db, client };
    }

    client = new MongoClient(uri, {
      maxPoolSize: 10,
      minPoolSize: 5,
      retryWrites: true,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    await client.connect();
    console.log("Connected to MongoDB database");

    db = client.db(dbName);

    await db.createCollection("songs");
    await db.createCollection("playlists");
    await db.createCollection("accounts");
    await db.createCollection("otp_histories");

    await db
      .collection("songs")
      .createIndex({ "metadata.common.title": "text" });
    await db.collection("accounts").createIndex({ email: 1 }, { unique: true });

    process.on("SIGINT", async () => {
      await client.close();
      process.exit(0);
    });

    return { db, client };
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

export const getDb = () => db && db;
export const getClient = () => client && client;
