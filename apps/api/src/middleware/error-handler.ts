import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors";
import { fail } from "../utils/response";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return fail(res, err.statusCode, err.message);
  }

  console.error(err);
  return fail(res, 500, "Error interno del servidor");
}

export function notFoundHandler(_req: Request, res: Response) {
  return fail(res, 404, "Ruta no encontrada");
}
