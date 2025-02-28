import {getMetadataForSongs} from "../utils/getMetaData.js";
import {getCommonData, getFormatData,} from "../utils/filterDataFromMetadata.js";
import {StatusCodes} from "http-status-codes";
import playlistSchema from "../models/playlist.model.js";
import accountSchema from "../models/account.model.js";

export async function parseMetadata(req, res, next) {
  const files = req.files;

  const listMetadata = await getMetadataForSongs(files);
  try {
    req.body.listMetadata = await Promise.all(
      listMetadata.map(async (item) => {
        const {
          metadata: { format, common },
        } = item;
        return {
          format: getFormatData(format),
          common: getCommonData(common),
        };
      })
    );
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.BAD_REQUEST).send({
      status: "failed",
      statusCode: StatusCodes.BAD_REQUEST,
      message: "Something went wrong when create song",
      error,
    });
  }
  next();
}

export async function validatePlaylistSchema(req, res, next) {
  try {
    const { playlist, userInfo } = req.body;
    console.log("check data", { playlist, userInfo });

    const object = {
      name: playlist,
      songs: [],
      owner: {
        email: userInfo.email,
        username: userInfo.username,
      },
    };

    req.body.playlist = await playlistSchema.validate(object);
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.BAD_REQUEST).send({
      status: "failed",
      statusCode: StatusCodes.BAD_REQUEST,
      message: "Something went wrong when create playlist",
    });
  }

  next();
}

export async function validateAccountSchema(req, res, next) {
  try {
    const { email, username, password, confirmPassword, providerId } =
      req.body.formData;
    let object = {};
    switch (providerId) {
      case "google":
        if (!email || !username) {
          return res.status(StatusCodes.BAD_REQUEST).send({
            status: "failed",
            statusCode: StatusCodes.BAD_REQUEST,
            message: "Please fill all the fields",
          });
        }
        object = {
          email,
          username,
          providerId,
        };
        break;
      case "form":
        if (!email || !username || !password || !confirmPassword) {
          return res.status(StatusCodes.BAD_REQUEST).send({
            status: "failed",
            statusCode: StatusCodes.BAD_REQUEST,
            message: "Please fill all the fields",
          });
        }
        object = {
          email,
          username,
          password,
          providerId,
        };
        break;
      default:
        return res.status(StatusCodes.BAD_REQUEST).send({
          status: "failed",
          statusCode: StatusCodes.BAD_REQUEST,
          message: "Invalid providerId",
        });
    }

    req.body.formData = await accountSchema.validate(object);
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.BAD_REQUEST).send({
      status: "failed",
      statusCode: StatusCodes.BAD_REQUEST,
      message: "Something went wrong when create account",
    });
  }
  next();
}

export async function checkFilesUploaded(req, res, next) {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No files uploaded",
    });
  }
  next();
}

export async function checkAddSongToPlaylist(req, res, next) {
  const { listPlaylists, songId } = req.body;

  console.log({ listPlaylists, songId });

  if (listPlaylists.length === 0) {
    return res.status(StatusCodes.OK).send({
      status: "ok",
      statusCode: StatusCodes.OK,
      message: "Cancel request because listPlaylists is empty",
    });
  }

  next();
}
