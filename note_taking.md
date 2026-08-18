# Setting the Telegram bot locally.

### Testing bot with curl

Creating a Bot in Telegram -> Bot Father.
/newbot
Copy the API token,
test with curl.
curl https://api.telegram.org/bot<TOKEN>/getme
curl https://api.telegram.org/bot<TOKEN>/getUpdates

### From typescript with bun

Installed bun, typescript native to it.
Testing with Ts, the call work.
Installing ZOD for type security on it.
`bun add zod`

Wrote a schema.ts with Zod but not need for now..
Tested Sending a message very easy just needed a chat_id and POST method.

### Hosting server with bun serve

No framework for current server listening, only two route and personal use. So way sufficient.
write the server.ts file

```
const port = Number(process.env.PORT ?? 3000);

Bun.serve({
  port,
  fetch(req) {
    const url = new URL(req.url);
    if (req.method == "GET" && url.pathname === "/health") {
      return new Response("Super");
    } else {
      return new Response("not found", { status: 404 });
    }
  },
});

console.log(console.log(`listening on http://localhost:${port}`));

```

bun --watch run src/server.ts

then just fetch it with curl curl localhost:3000/health

### Testing Webhook with cloudflare and local bun server

Added a routing to /telegram/webhook & and webhook Token

then
`brew install cloudflared`
`cloudflared tunnel --url http://localhost:3000`

run the `bun --watch src/server.ts`
copy the html from cloudflared -> This is the html that cloudlfare uses to server our server.

https://passage-migration-zshops-slides.trycloudflare.com

set the webhook in telegram, giving to our bot, the url of the cloudflare as well as the token it needs to write to our server.

Did it in a ts file in scratch set-webhook. Basical it is a POST to bot/setwebhook with an url in th e body.
`bun run scratch/set-webhook.ts https://passage-migration-zshops-slides.trycloudflare.com`

It need to match the url of cloudflare + the "endpoinmt" in your server
Then all text sent to the bot, are linked ot the webhook and it triggers on the bun server.

@BotFather → /revoke → pick your bot → new token → update .env
openssl rand -hex 32 → new TELEGRAM_WEBHOOK_SECRET → update .env
bun run scratch/set-webhook.ts <tunnel-url>

### Formatting to write in the database.

Thinking of hexagonal architecture, following the principle of separation of concerns

```bash
src/server.ts       transport — HTTP only
src/pipeline.ts     use case  — what happens to a meal
src/db.ts           repository — SQL only
src/telegram.ts     adapter — talks to Telegram
src/ai.ts           adapter — talks to Anthropic
src/schema.ts       the contract
```

I want to test wirting to duckdb, sqlite and Postgres.
Adding folder data/ with different db init.
data for now located in scratch. Db of type duckdb is not recommended as main pipeline storage as several process can't use it simultanously. For anlytical pipline it's great but if a process need to update while another need to write on it.. It will fail.
Still good ideas to attach it to postgres when needed.

With sqlite, needed to create sqlite script to connect to sqlite file, create the table.
Then a line that insert into table, turn this into function and add it to the pipeline.ts that treats on going message.
First run `bun run db/sqlite.ts`
Then add it to the pipeline.ts.
`sqlite3 scratch/data/dev.sqlite` -> Works!
