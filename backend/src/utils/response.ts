import { Response } from "express";

export function sendResponse(
  res: Response,
  status: number,
  message: string,
  data?: unknown
) {
  return res.status(status).json({
    success: true,
    message,
    data: data ?? null
  });
}
