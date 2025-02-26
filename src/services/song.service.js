import { getDb } from "../configs/dbConfig.js";
import { ObjectId } from "mongodb";

export async function findAllSong() {
  try {
    const db = getDb();
    const songColl = await db.collection("songs");
    return await songColl.find().toArray();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function findSongById(id) {
  try {
    const db = getDb();
    const songColl = await db.collection("songs");
    return await songColl.find({ _id: new ObjectId(id) }).toArray();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function findSongByName(name) {
  try {
    const db = getDb();
    const songColl = await db.collection("songs");
    return await songColl.find({ $text: { $search: name } }).toArray();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function insertSongs(songs) {
  try {
    const db = getDb();
    const songColl = await db.collection("songs");
    return await songColl.insertMany(songs);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function removeSong(id) {
  try {
    const db = getDb();
    const songColl = await db.collection("songs");
    return await songColl.deleteOne({ _id: new ObjectId(id) });
  } catch (error) {
    console.error(error);
    throw error;
  }
}
