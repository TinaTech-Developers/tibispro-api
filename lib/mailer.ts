import nodemailer from "nodemailer";

export const sendResetEmail = async (
  to: string,
  resetLink: string,
): Promise<void> => {
  console.log("EMAIL:", "tibizpro.app@gmail.com");
  console.log("PASSWORD EXISTS:", !!process.env.GMAIL_APP_PASSWORD);
  console.log("PASSWORD LENGTH:", process.env.GMAIL_APP_PASSWORD?.length);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "tibizpro.app@gmail.com",
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.verify();

  console.log("SMTP VERIFIED");

  await transporter.sendMail({
    from: `"TiBizPro" <tibizpro.app@gmail.com>`,
    to,
    subject: "Password Reset Request",
    html: `
      <h2>Password Reset</h2>
      <a href="${resetLink}">Reset Password</a>
    `,
  });
};
