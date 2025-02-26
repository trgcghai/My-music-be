import { array, date, number, object, string } from "yup";

const songMetadataSchema = object({
  originalName: string().required(),
  publicId: string().required(),
  url: string().required(),
  format: string().required(),
  duration: number().required(),
  size: number().required(),
  metadata: {
    format: object({
      tagTypes: array().of(string().required()).required(),
      codec: string().required(),
      sampleRate: number().required(),
      bitrate: number().required(),
      duration: number().required(),
    }).required(),
    common: object({
      title: string().required(),
      artists: array().of(string().required()).required(),
      artist: string().required(),
      album: string().required(),
      year: number().required(),
    }).required(),
  },
  createdAt: date().default(() => new Date()),
  lastModified: date().default(() => new Date()),
});

export default songMetadataSchema;
