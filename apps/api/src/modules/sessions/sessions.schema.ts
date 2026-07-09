import { z } from "zod";

// Iniciar timer (sin datos) o registrar sesión manual con inicio/fin.
export const createSessionSchema = z.object({
  startedAt: z.string().datetime().optional(),
  endedAt: z.string().datetime().optional(),
  note: z.string().optional(),
});

export const updateSessionSchema = z.object({
  startedAt: z.string().datetime().optional(),
  endedAt: z.string().datetime().nullable().optional(),
  note: z.string().nullable().optional(),
});
