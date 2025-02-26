import { object, string, date } from "yup";

const accountSchema = object({
  username: string().trim().required(),
  email: string().email().required(),
  password: string().nullable(),
  providerId: string().required(),
  createdAt: date().default(() => new Date()),
  lastModified: date().default(() => new Date()),
});

export default accountSchema;
