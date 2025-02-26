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
    console.log("name", name);
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

router.post(
  "/",
  upload.array("files"),
  checkFilesUploaded,
  parseMetadata,
  async (req, res) => {
    try {
      const { successes, failures } = await uploadMultiple(req.files);
      const { listMetadata } = req.body;

      console.log("listMetadata", listMetadata);
      console.log("successes", successes);

      const listToInsert = listMetadata.map((item, index) => {
        return {
          ...successes[index],
          originalName: item.common.title + ".mp3",
          metadata: {
            format: {
              ...item.format,
            },
            common: {
              ...item.common,
            },
          },
        };
      });

      console.log("listToInsert", listToInsert);

      const insertResult = await insertSongs(listToInsert);

      // Trả về kết quả
      res.json({
        success: true,
        message: "Files processed",
        totalProcessed: successes.length + failures.length,
        successCount: successes.length,
        failureCount: failures.length,
        files: successes,
        failed: failures,
        insertResult,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
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

// eslint-disable-next-line no-unused-vars
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 20MB",
      });
    }
  }

  res.status(500).json({
    success: false,
    message: error.message || "Something went wrong",
  });
});

export default router;
