const token = process.env.TELEGRAM_BOT_TOKEN;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
const base = process.argv[2];

if (!token || !secret)
  throw new Error(
    "missing TELEGRAM_BOT_TOKEN or TELEGRAM_WEBHOOK_SECRET in .env",
  );
if (!base)
  throw new Error(
    "usage: bun run scratch/set-webhook.ts https://passage-migration-zshops-slides.trycloudflare.com",
  );

const url = `${base.replace(/\/$/, "")}/telegram/webhook`;

const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    url,
    secret_token: secret,
    allowed_updates: ["message"],
    drop_pending_updates: true,
  }),
});

console.log(url, "→", await res.json());
