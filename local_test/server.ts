const port = Number(process.env.PORT ?? 3000);

Bun.serve({
  port,
  async fetch(req) {
    const url = new URL(req.url);
    if (req.method == "GET" && url.pathname === "/health") {
      return new Response("Super");
    }

    if (req.method === "POST" && url.pathname === "/telegram/webhook") {
      if (
        req.headers.get("x-telegram-bot-api-secret-token") !==
        process.env.TELEGRAM_WEBHOOK_SECRET
      ) {
        return new Response("unauthorized", { status: 401 });
      }
      const update = await req.json();
      console.log(JSON.stringify(update, null, 2));
      return new Response("ok");
    }

    return new Response("not found", { status: 404 });
  },
});

console.log(console.log(`listening on http://localhost:${port}`));
