import type { Response } from "express";

export function ok<T>(res: Response, data: T, statusCode = 200) {
  return res.status(statusCode).json({ status: "success", data });
}

export function fail(res: Response, statusCode: number, message: string) {
  return res.status(statusCode).json({ status: "error", message });
}
