import { z } from "zod";

export const notificationSettingsSchema = z.object({
  deadline_days: z.coerce.number().int().min(1).max(14).default(3),
  notif_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Format jam harus HH:mm")
    .default("08:00"),
  is_active: z.boolean().default(true),
});

export type NotificationSettingsInput = z.infer<typeof notificationSettingsSchema>;

