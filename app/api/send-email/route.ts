import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Mark the route as dynamic
export const dynamic = "force-dynamic";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NEXT_PUBLIC_EMAIL_USER,
    pass: process.env.NEXT_PUBLIC_EMAIL_PASSWORD,
  },
});

export async function POST(req: Request) {
  try {
    const { to, subject, message, attachments } = await req.json();

    const mailOptions = {
      from: process.env.NEXT_PUBLIC_EMAIL_USER,
      to,
      subject,
      text: message,
      attachments: attachments?.map((attachment: any) => ({
        filename: attachment.name,
        content: attachment.content,
        encoding: "base64",
      })),
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
