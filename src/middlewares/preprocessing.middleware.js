import pkg from "crypto-js";
const { SHA256 } = pkg;

export async function encryptPassword(req, res, next) {
  const { password, providerId } = req.body.formData;
  if (providerId == "google") {
    return next();
  }
  const hashedPassword = SHA256(password).toString();
  req.body.formData.password = hashedPassword;
  next();
}
