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

### Formatting & write in the database.

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

- Finish sqlite3 Testing.
- Set up Local postgres + pipeline writing to it.
- connect duckdb to it - OLAP.

### Creating postgres docker compose

wrote the comnpose.yml for the docker container to host local postgres db

```bash
docker compose up -d
docker compose exec postgres psql -U pao -d diet_agent
```

Create a throw_away table then `docker compose down` and restart to ensure volume well configured: - Silent problem

To run the intial migration and creation of table the best way is to have local files and run them via

```bash
docker compose exec -T postgres psql -U diet -d diet_agent < migrations/001_init.sql
```

`migrate.ts` is Not being a migration but the actual bootstrap.

In the migrate.ts we connect to db via import {sql} from bun which implicitely read the string in the .env.

It create the migration table and look at the current sql file in migratons/
It only applies those that havent been applied in the db yet.

```json
 "scripts": {
    "dev": "bun --watch run src/server.ts",
    "migrate": "bun src/scripts/migrate.ts"
  },
```

Then when create the first file
`bun run migrate`

```bash
➜  diet_agent git:(main) ✗ bun run migrate
$ bun src/scripts/migrate.ts
+ 001_create_raw_event.sql
migrations up to date
```

### Writring in the postgres.

Create the db file which SQL insert payload in the table. Called by the pipeline.ts when server is triggered by payload.

- all Works, Telegram triggers webhook and write in the postgres raw_event.

Now Handling of messaging Transfromation?

# Strategic Direction

Reframing the project as telegram Pipepline to DB that is repoduciable and adaptable to any schemma and Use Case!

### Parsing text with AI & Writing in the database.

Reading the text, extraacting the information and parsing it into specific format with force tool using zod json schema.
Created two meal and meal_items tabels in migration 002.
Enforced the AI parsing via Zod schema as a tool.
the parsing is quick and saved in the database for both meal and mealItems.

### Write back

Started write back with simple non-read db response using direct AI return to responsd to message.
-> Need to write on Quick summary of daily objective now
This involves have user table with profile -> kg, size etc.. & Daily objective and weekly objective.
This will later evolved thanks to Added Training part.

\\ Need to work on Format and parsed type consitency.
