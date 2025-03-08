import express from "express";
import { StatusCodes } from "http-status-codes";
import multer from "multer";
import {
  findAllSong,
  findSongById,
  findSongByName,
  insertSongs,
  removeSong,
} from "../services/song.service.js";
import { uploadMultiple } from "../services/upload.service.js";
import {
  checkFilesUploaded,
  parseMetadata,
} from "../middlewares/validateSchema.middleware.js";
import { getMetadataForSongs } from "../utils/getMetaData.js";
import songMetadataSchema from "../models/song.model.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
});

router.get("/", async (req, res) => {
  const { name } = req.query;
  if (name) {
    const result = await findSongByName(req.query.name);
    return res.status(StatusCodes.OK).send({
      status: "success",
      code: StatusCodes.OK,
      result,
    });
  }

  const result = await findAllSong();
  return res.status(StatusCodes.OK).send({
    status: "success",
    code: StatusCodes.OK,
    result,
  });
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const result = await findSongById(id);
  return res.status(StatusCodes.OK).send({
    status: "success",
    code: StatusCodes.OK,
    result,
  });
});

router.post("/getByListId", async (req, res) => {
  const { listId } = req.body;

  console.log("listId", listId);

  const setIds = new Set(listId);

  console.log("setIds", setIds);

  return res.status(StatusCodes.OK).send({
    status: "success",
    code: StatusCodes.OK,
  });
});

router.post(
  "/",
  upload.array("files"),
  checkFilesUploaded,
  parseMetadata,
  async (req, res) => {
    try {
      const { successes, failures } = await uploadMultiple(req.files);

      const listMetadata = await getMetadataForSongs(successes);

      const listToInsert = listMetadata.map((item, index) => {
        const successItem = successes[index];
        return {
          originalName: item.metadata.common.title + "." + successItem.format,
          asset_id: successItem.asset_id,
          publicId: successItem.public_id,
          url: successItem.url,
          secure_url: successItem.secure_url,
          playback_url: successItem.playback_url,
          format: successItem.format,
          duration: successItem.duration,
          buffer: successItem.buffer,
          mimetype: successItem.mimetype,
          metadata: {
            format: {
              tagTypes: item.metadata.format.tagTypes,
              codec: item.metadata.format.codec,
              sampleRate: item.metadata.format.sampleRate,
              bitrate: item.metadata.format.bitrate,
              duration: item.metadata.format.duration,
            },
            common: {
              title: item.metadata.common.title,
              artists: item.metadata.common.artists,
              artist: item.metadata.common.artist,
              album: item.metadata.common.album,
              year: item.metadata.common.year,
              picture: item.metadata.common.picture,
            },
          },
        };
      });

      await Promise.all(
        listToInsert.map(async (item) => {
          return await songMetadataSchema.validate(item);
        })
      );

      const insertResult = await insertSongs(listToInsert);

      return res.status(StatusCodes.OK).send({
        success: true,
        totalProcessed: successes.length + failures.length,
        successCount: successes.length,
        failureCount: failures.length,
        files: successes,
        failed: failures,
        insertResult,
      });
    } catch (error) {
      console.error(error);
      res.status(StatusCodes.BAD_REQUEST).send({
        success: false,
        code: StatusCodes.BAD_REQUEST,
        message: error.message || "Internal server error",
        error,
      });
    }
  }
);

router.delete("/:songId", async (req, res) => {
  const { songId } = req.params;
  const result = await removeSong(songId);
  return res.status(StatusCodes.OK).send({
    statusCode: StatusCodes.OK,
    message: "Song Removed Successfully",
    result,
  });
});

export default router;
