import express from "express";
import { StatusCodes } from "http-status-codes";
import {
  checkAddSongToPlaylist,
  validatePlaylistSchema,
} from "../middlewares/validateSchema.middleware.js";
import {
  addSongToPlaylist,
  findAllPlaylist,
  findPlaylistByEmail,
  findPlaylistById,
  insertPlaylist,
  removePlaylist,
  removeSongFromPlaylist,
  updatePlaylist,
} from "../services/playlist.service.js";
import { findSongById } from "../services/song.service.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { email } = req.query;

  if (email) {
    const result = await findPlaylistByEmail(email);
    return res.status(StatusCodes.OK).send({
      status: "success",
      code: StatusCodes.OK,
      result,
    });
  }

  const result = await findAllPlaylist();
  return res.status(StatusCodes.OK).send({
    status: "success",
    code: StatusCodes.OK,
    result,
  });
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const result = await findPlaylistById(id);
  if (result) {
    return res.status(StatusCodes.OK).send({
      status: "success",
      code: StatusCodes.OK,
      result,
    });
  }
  return res.status(StatusCodes.NOT_FOUND).send({
    status: "failed",
    code: StatusCodes.NOT_FOUND,
    message: "Playlist not found",
  });
});

router.post("/", validatePlaylistSchema, async (req, res) => {
  const { playlist } = req.body;
  const result = await insertPlaylist([playlist]);
  return res.status(StatusCodes.OK).send({
    status: "success",
    code: StatusCodes.OK,
    result,
  });
});

router.put("/:playlistId", async (req, res) => {
  const { playlistId } = req.params;
  const { playlist } = req.body;

  const result = await updatePlaylist(playlistId, playlist);

  return res.status(StatusCodes.OK).send({
    status: "success",
    code: StatusCodes.OK,
    result,
  });
});

router.delete("/:playlistId", async (req, res) => {
  const { playlistId } = req.params;
  const result = await removePlaylist(playlistId);
  return res.status(StatusCodes.OK).send({
    status: "success",
    code: StatusCodes.OK,
    result,
  });
});

router.post("/addSong", checkAddSongToPlaylist, async (req, res) => {
  try {
    const { listPlaylists, songId } = req.body;

    const song = await findSongById(songId);
    const songObject = {
      _id: song[0]._id,
      originalName: song[0].originalName,
      publicId: song[0].publicId,
      url: song[0].url,
      format: song[0].format,
      duration: song[0].duration,
      common: {
        ...song[0].metadata.common,
      },
    };

    const addSongResult = await addSongToPlaylist(listPlaylists, songObject);

    console.log({ addSongResult });

    return res.status(StatusCodes.OK).send({
      status: "success",
      code: StatusCodes.OK,
      result: addSongResult,
    });
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: "failed",
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      result: error,
    });
  }
});

router.post("/removeSong", async (req, res) => {
  try {
    const { playlistId, songId } = req.body;
    console.log({ playlistId, songId });
    const result = await removeSongFromPlaylist(playlistId, songId);
    return res.status(StatusCodes.OK).send({
      status: "success",
      code: StatusCodes.OK,
      result,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: "failed",
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      result: error,
    });
  }
});

router.post(
  "/createPlaylistWithSong",
  validatePlaylistSchema,
  async (req, res) => {
    try {
      const { playlist, songId } = req.body;

      const song = await findSongById(songId);

      if (!song) {
        return res.status(StatusCodes.BAD_REQUEST).send({
          status: "failure",
          code: StatusCodes.BAD_REQUEST,
          message: "Song not found",
        });
      }

      playlist.songs.push(song[0]);
      const result = await insertPlaylist([playlist]);

      return res.status(StatusCodes.OK).send({
        status: "success",
        code: StatusCodes.OK,
        result,
      });
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "failed",
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        result: error,
      })
    }
  }
);

export default router;
