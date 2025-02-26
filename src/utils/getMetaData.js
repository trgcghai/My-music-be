import { parseBuffer } from "music-metadata";

export async function getMetadataForSongs(files) {
  return await Promise.all(
    files.map(async (file) => {
      const metadata = await parseBuffer(file.buffer, file.mimetype);
      return {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        metadata,
      };
    })
  );
}
