import { z } from "zod";

export const transportReportSchema = z.object({
  reportDate: z.string().min(1, "Tanggal wajib diisi."),
  distanceKm: z.coerce.number().positive("Jarak harus lebih dari 0."),
  trips: z.coerce.number().int().min(1, "Jumlah perjalanan minimal 1.").max(12),
  isRoundTrip: z.boolean().default(false),
  occupancy: z
    .union([z.coerce.number().positive().max(20), z.nan(), z.null(), z.undefined()])
    .transform((value) => (typeof value === "number" && !Number.isNaN(value) ? value : null)),
  actualModeId: z.string().min(1, "Moda aktual wajib dipilih."),
  baselineModeId: z.string().min(1, "Moda baseline wajib dipilih."),
});

export type TransportReportInput = z.infer<typeof transportReportSchema>;
