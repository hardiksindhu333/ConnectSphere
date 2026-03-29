import { Resend } from "resend";

export const getResendClient = () => {
  return new Resend(process.env.RESEND_API_KEY);
};