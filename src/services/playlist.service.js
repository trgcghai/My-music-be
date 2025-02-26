import { ObjectId } from "mongodb";
import { getDb } from "../configs/dbConfig.js";

export async function findAllPlaylist() {
  try {
    const db = getDb();
    const playlistColl = await db.collection("playlists");
    return await playlistColl.find().toArray();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function findPlaylistByEmail(email) {
  try {
    const db = getDb();
    const playlistColl = await db.collection("playlists");
    return await playlistColl.find({ "owner.email": email }).toArray();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function findPlaylistById(id) {
  try {
    const db = getDb();
    const playlistColl = await db.collection("playlists");
    return await playlistColl.find({ _id: new ObjectId(id) }).toArray();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function insertPlaylist(playlists) {
  try {
    const db = getDb();
    const playlistColl = await db.collection("playlists");
    return await playlistColl.insertMany(playlists);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function removePlaylist(id) {
  try {
    const db = getDb();
    const playlistColl = await db.collection("playlists");
    return await playlistColl.deleteOne({ _id: new ObjectId(id) });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function addSongToPlaylist(listPlaylists, song) {
  try {
    const db = getDb();
    const playlistColl = await db.collection("playlists");

    return await playlistColl.updateMany(
      { _id: { $in: listPlaylists.map((id) => new ObjectId(id)) } },
      { $addToSet: { songs: song } }
    );
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function updatePlaylist(id, name) {
  try {
    const db = getDb();
    const playlistColl = await db.collection("playlists");
    return await playlistColl.updateOne(
      { _id: new ObjectId(id) },
      { $set: { name, lastModified: new Date() } }
    );
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function removeSongFromPlaylist(playlistId, songId) {
  try {
    const db = getDb();
    const playlistColl = await db.collection("playlists");
    return await playlistColl.updateOne(
      { _id: new ObjectId(playlistId) },
      { $pull: { songs: { _id: new ObjectId(songId) } } }
    );
  } catch (error) {
    console.error(error);
    throw error;
  }
}
