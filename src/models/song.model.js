import { array, date, mixed, number, object, string } from "yup";

const songMetadataSchema = object({
  originalName: string().required(),
  asset_id: string().required(),
  publicId: string().required(),
  url: string().required(),
  secure_url: string().required(),
  playback_url: string().required(),
  format: string().required(),
  duration: number().required(),
  buffer: mixed()
    .test("is buffer", "Field must be a Buffer", (value) =>
      // eslint-disable-next-line no-undef
      Buffer.isBuffer(value)
    )
    .required(),
  mimetype: string().required(),
  metadata: object({
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
      picture: array()
        .of(
          object({
            format: string().required(),
            type: string().required(),
            description: string().required(),
            data: mixed()
              .test(
                "is unit8array",
                "Field must be an unit8array",
                (value) => value instanceof Uint8Array
              )
              .required(),
          })
        )
        .default([]),
    }).required(),
  }).required(),
  createdAt: date().default(() => new Date()),
  lastModified: date().default(() => new Date()),
});

export default songMetadataSchema;
