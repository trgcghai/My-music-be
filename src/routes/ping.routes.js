import express from "express";
import {StatusCodes} from "http-status-codes";
import songMetadataModel from "../models/song.model.js";

const router  = express.Router()

router.get('/', async (req, res) => {
    const indexes = await songMetadataModel.collection.indexes()
    return res.json({status: StatusCodes.OK, message: 'Song has been successfully saved', indexes});
})

export default router
