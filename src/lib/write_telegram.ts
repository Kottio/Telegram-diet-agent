const token = process.env.TELEGRAM_BOT_TOKEN;

export async function writeTelegram(chatId: number, text: string) {
  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    },
  );
  // console.log(response);
  return response;
}
