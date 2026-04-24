import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY!);

export const EMAIL_FROM = process.env.EMAIL_FROM || "Allen Chen <allenchen@the-quiet-way.com>";

export const isEmailConfigured = !!process.env.RESEND_API_KEY;
