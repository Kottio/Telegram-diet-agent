interface message_raw_props {
  update_id: number;
  message: {
    message_id: number;
    from: {
      id: number;
      is_bot: Boolean;
      first_name: string;
      language_code: String;
    };
    chat: {
      id: number;
      first_name: string;
      type: string;
    };
    date: number;
    text: string;
  };
}

import { insertRawMessage } from "../scratch/db/sqlite";

export function clean_raw_message(raw_message: message_raw_props) {
  const updateId = raw_message.update_id;
  const rawText = raw_message.message.text;
  const chatId = raw_message.message.chat.id;
  const receivedAt = raw_message.message.date;
  console.log(
    "Loading the following in the sql Lite",
    updateId,
    chatId,
    rawText,
    receivedAt,
  );

  insertRawMessage(updateId, chatId, rawText);
}
