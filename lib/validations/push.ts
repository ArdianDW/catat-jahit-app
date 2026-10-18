import { z } from "zod";

const BASE64URL_REGEX = /^[A-Za-z0-9\-_]+={0,2}$/;

export const pushSubscriptionSchema = z.object({
  endpoint: z
    .string()
    .url("Endpoint push harus berupa URL valid")
    .startsWith("https://", "Endpoint push harus menggunakan HTTPS"),

  keys: z.object({
    p256dh: z
      .string()
      .min(1, "p256dh wajib diisi")
      .regex(BASE64URL_REGEX, "p256dh harus berformat base64url"),

    auth: z
      .string()
      .min(1, "auth wajib diisi")
      .regex(BASE64URL_REGEX, "auth harus berformat base64url"),
  }),
});

export type PushSubscriptionInput = z.infer<typeof pushSubscriptionSchema>;
