// Unused for now

import { z } from "zod";
export const TelegramUpdate = z.object({});
export type TelegramUpdate = z.infer<typeof TelegramUpdate>;

// interface message_raw_props {
//   update_id: Number;
//   message: {
//     message_id: Number;
//     from: {
//       id: Number;
//       is_bot: Boolean;
//       first_name: String;
//       language_code: String;
//     };
//     chat: {
//       id: Number;
//       first_name: String;
//       type: String;
//     };
//     date: Number;
//     text: String;
//   };
// }

export type NewRawEvent = {
  updateId: number;
  chatId: number;
  receivedAt: Date;
  rawText: string | null;
  payload: unknown;
};
