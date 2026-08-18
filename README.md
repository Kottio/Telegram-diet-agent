# diet_agent

Text a Telegram bot what you ate. It becomes structured rows in your own Postgres.
Serve result to Dashboard on evidence.dev

```
Telegram → webhook → raw_event (immutable) → AI parse → validate → meal + meal_item
                                                          ↘ quarantine
```

Personal project, built in public. The build journal — every step and why —
lives in [`note_taking.md`](./note_taking.md).

## Status

|     | milestone                               | state   |
| --- | --------------------------------------- | ------- |
| M0  | Telegram bot created                    | ✅      |
| M1  | Bun server, `/health`                   | ✅      |
| M2  | Webhook reaching localhost via tunnel   | ✅      |
| M3  | Message stored in Postgres              | ⬜ next |
| M4  | Answer fast, process after              | ⬜      |
| M5  | AI returns structured items             | ⬜      |
| M6  | Validation boundary (Zod → quarantine)  | ⬜      |
| M7  | `meal` + `meal_item` in one transaction | ⬜      |
| M8  | Bot replies with the breakdown          | ⬜      |
| M9  | Retry — nothing gets lost               | ⬜      |

## Stack

Bun (runtime + package manager, TypeScript native) · `Bun.serve` — no framework,
two routes · Zod for the validation boundary · Postgres via `Bun.sql` · Anthropic API.

Dependencies: `zod`. That's the list.

## Setup

```bash
bun install
cp .env.example .env     # then fill it in
```

`.env`:

```
TELEGRAM_BOT_TOKEN=        # @BotFather → /newbot
TELEGRAM_WEBHOOK_SECRET=   # openssl rand -hex 32
PORT=3000
```

## Running locally

Three terminals.

```bash
# 1 — the server
bun run dev

# 2 — the tunnel (Telegram requires public HTTPS)
cloudflared tunnel --url http://127.0.0.1:3000

# 3 — point the bot at that tunnel URL
bun run scratch/set-webhook.ts https://<tunnel-url>
```

Then message the bot. The free tunnel URL rotates on every restart — re-run step 3
when it does.

Sanity checks:

```bash
curl localhost:3000/health                                  # → Super
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"   # last_error_message?
```

`getWebhookInfo` is the first debugging move, not the last: it's Telegram telling you
exactly why delivery failed.

## Layout

```
src/server.ts              the server — /health + /telegram/webhook
scratch/set-webhook.ts     registers the webhook URL with Telegram
scratch/poll.ts            getUpdates polling — debugging only, conflicts with webhooks
note_taking.md             build journal
```

## Notes

- Webhook config lives on **Telegram's** servers, not in this repo. It survives
  restarts and token revocation — which is why a rotated tunnel URL breaks delivery
  silently until you re-register.
- Two secrets, opposite directions: the **bot token** authenticates you → Telegram,
  the **webhook secret** authenticates Telegram → you.
- `message.date` is Unix **seconds**. Multiply by 1000.
- Polling and webhooks are mutually exclusive — `getUpdates` returns 409 while a
  webhook is set.
