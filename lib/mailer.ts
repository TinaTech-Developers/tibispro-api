import nodemailer from "nodemailer";

export const sendResetEmail = async (
  to: string,
  resetLink: string,
): Promise<void> => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "tibizpro.app@gmail.com",
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.verify();

  console.log("EMAIL TO:", to);
  console.log("RESET LINK SENT:", resetLink);

  await transporter.sendMail({
    from: `"TiBizPro" <tibizpro.app@gmail.com>`,
    to,
    subject: "Reset your TiBizPro password",
    text: `Click the link below to reset your password:

${resetLink}

This link expires in 15 minutes.`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family:Arial;background:#f5f5f5;padding:40px;">
<div style="max-width:600px;margin:auto;background:#ffffff;padding:30px;border-radius:10px">

<h2 style="color:#2563EB;">
Reset Your Password
</h2>

<p>
We received a request to reset your TiBizPro password.
</p>

<p>
Click the button below:
</p>

<p style="text-align:center;margin:30px 0;">
<a
href="${resetLink}"
style="
background:#2563EB;
color:#ffffff;
padding:14px 30px;
border-radius:6px;
text-decoration:none;
display:inline-block;
font-weight:bold;
">
Reset Password
</a>
</p>

<p>
If the button doesn't work, copy and paste this link:
</p>

<p style="word-break:break-all;">
${resetLink}
</p>

<p>
This link expires in <strong>15 minutes</strong>.
</p>

<hr>

<p style="color:#888;font-size:12px">
Powered by TinaSoft Nexus
</p>

</div>
</body>
</html>
`,
  });
};
