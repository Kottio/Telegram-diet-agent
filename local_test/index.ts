import { GetUpdates } from "./schemas";
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error("Telegram bot token not found!");

// const res = await fetch(`https://api.telegram.org/bot${token}/getme`);

// const body = (await res.json()) as {
//   ok: boolean;
//   result?: { id: number; first_name: string; username: string };
//   description?: string;
// };

// if (!body.ok || !body.result) {
//   console.error("Telegram bot refused the access");
//   process.exit(1);
// } else {
//   console.log(`✅: @${body.result.username}`);
// }

const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
const data = GetUpdates.parse(await res.json());

if (!data.ok) {
  console.error("Telegram refused our Token API call");
}

const messages = data.result.map((x) => x.message?.text);
console.log(messages);

// const chat_id = 8869193928;
// const response = await fetch(
//   `https://api.telegram.org/bot${token}/sendMessage`,
//   {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ chat_id, text: "Hey there this is a test" }),
//   },
// );
// console.log(response);
