import nodemailer from "nodemailer";

export const sendResetEmail = async (
  to: string,
  resetLink: string,
): Promise<void> => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "tibizpro.app@gmail.com",
      pass: process.env.GMAIL_APP_PASSWORD as string,
    },
  });

  await transporter.sendMail({
    from: `"TiBizPro" <tibizpro.app@gmail.com>`,
    to,
    subject: "Password Reset Request",
    html: `
      <h2>Password Reset</h2>
      <p>You requested a password reset.</p>
      <a href="${resetLink}">Click here to reset your password</a>
      <p>If you didn't request this, ignore this email.</p>
    `,
  });
};
