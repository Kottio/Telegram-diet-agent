import { z } from "zod";

export const GetUpdates = z.object({
  ok: z.literal(true),
  result: z.array(
    z.object({
      update_id: z.number(),
      message: z
        .object({
          text: z.string().optional(),
          chat: z.object({ id: z.number() }),
        })
        .optional(),
    }),
  ),
});
