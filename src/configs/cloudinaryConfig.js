/* eslint-disable no-undef */
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME || "dthvciqeu",
  api_key: process.env.CLOUDINARY_API_KEY || "784973211484813",
  api_secret:
    process.env.CLOUDINARY_API_SECRET || "xUCqcqZzL-MXXHS9drIsaZ4q5LU",
});

export default cloudinary;
