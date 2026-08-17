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
const json_response = await res.json();
// if (!json_response.ok) {
//   process.exit(1);
// }
console.log(json_response);
