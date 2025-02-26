import { array, date, number, object, string } from "yup";

const playlistSchema = object({
  name: string().trim().required(),
  songs: array().of(
    object({
      _id: string().required(),
      originalName: string().required(),
      publicId: string().required(),
      url: string().required(),
      format: string().required(),
      duration: number().required(),
      common: object({
        title: string().required(),
        artists: array().of(string().required()).required(),
        artist: string().required(),
        album: string().required(),
        year: number().required(),
      }).required(),
    })
  ),
  owner: object({
    email: string().required(),
    username: string().required(),
  }),
  createdAt: date().default(() => new Date()),
  lastModified: date().default(() => new Date()),
});

export default playlistSchema;
