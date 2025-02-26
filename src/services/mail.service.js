/* eslint-disable no-undef */
import fs from "fs";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: process.env.MAIL_PORT === 465,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export async function sendMail({ to, otp, subject, title, subTitle, content }) {
  const htmlTemplate = fs.readFileSync(
    "./src/templates/otpTemplate.html",
    "utf8"
  );
  const emailContent = htmlTemplate
    .replace("{{OTP_CODE}}", otp)
    .replace("{{TITLE}}", title)
    .replace("{{SUBTITLE}}", subTitle)
    .replace("{{CONTENT}}", content);

  await transporter.sendMail({
    from: `My music app <${process.env.MAIL_USER}>`,
    to,
    subject,
    html: emailContent,
  });
}
