import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.eu",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_HEY_USER || "hey@bloomcontent.site",
    pass: process.env.SMTP_HEY_PASS || "",
  },
});

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  return transporter.sendMail({
    from: '"ContentBloom" <hey@bloomcontent.site>',
    to,
    subject,
    text,
    html,
  });
}
