import { Readable } from "stream";
import cloudinary from "../configs/cloudinaryConfig.js";

export const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        folder: "audio",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    // Convert buffer to stream
    const bufferStream = new Readable();
    bufferStream.push(buffer);
    bufferStream.push(null);
    bufferStream.pipe(stream);
  });
};

export const uploadMultiple = async (files) => {
  // Upload tất cả file lên Cloudinary
  const uploadPromises = files.map(async (file) => {
    try {
      const result = await uploadToCloudinary(file.buffer);
      return {
        ...result,
        buffer: file.buffer,
        mimetype: file.mimetype,
      };
    } catch (error) {
      console.error(`Error uploading ${file.originalname}:`, error);
      return {
        originalName: file.originalname,
        error: "Failed to upload",
      };
    }
  });

  // Đợi tất cả file upload xong
  const results = await Promise.all(uploadPromises);

  // Phân tách kết quả thành công và thất bại
  const successes = results.filter((r) => !r.error);
  const failures = results.filter((r) => r.error);

  return { successes, failures };
};
