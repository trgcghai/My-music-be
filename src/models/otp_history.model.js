import { object, date, string, number } from "yup";

const otpHistorySchema = object({
  account_id: string().required(),
  hash: string().required(),
  expiresAt: number().required(),
  createdAt: date().default(() => new Date()),
  lastModified: date().default(() => new Date()),
});

export default otpHistorySchema;
