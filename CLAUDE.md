# CLAUDE.md

## What this repo is

A **skeleton for conversational data capture**: messages sent to a chat bot become
validated, structured rows in Postgres, with dbt marts and an Evidence dashboard on
top. The current instance captures meals. **The domain is meant to be swapped.**

Read `README.md` to run it. `note_taking.md` is the build journal.

## The domain lives in exactly three places

1. **the prompt** — what the model is asked to extract
2. **the Zod schema** — the contract it must satisfy (the model's tool schema is
   *derived* from this, never written twice)
3. **the migration** — the target tables

Everything else is domain-agnostic infrastructure. If adapting the domain requires
touching a fourth file, that's a design smell — say so rather than quietly working
around it.

---

## Invariants — do not break these

These are the point of the project. A change that violates one is wrong even if it
works and even if the user asks for it; push back and explain.

1. **`raw_event` is append-only.** Never `update`, never `delete`. Everything
   downstream is derived, which is what makes any later change a *backfill* rather
   than a restart.
2. **Store the full payload as `jsonb`.** Extracted columns are convenience. Promote a
   field from the payload to a column only when you need to query or index it.
3. **Model output is untrusted input.** It passes Zod validation or it goes to
   `quarantine` — stored, never dropped, never crashed on. Nothing unvalidated reaches
   a typed table.
4. **Idempotency:** `unique (source, update_id)`. Chat platforms retry deliveries; this
   constraint is what makes that harmless. Never remove it.
5. **Answer the webhook before doing slow work.** Store raw, return 200, then process.
   Never `await` an AI call before responding.
6. **Corrections are events, not updates.** Never overwrite the model's original guess
   — that data is what proves the system improved.
7. **Every derived row carries provenance:** model id, prompt version, parser version.
   Without it, history can't be re-run or explained.
8. **Migrations are append-only.** Never edit an applied file; add a new one.
9. **No LLM in the write path's control flow.** Same input must produce the same rows,
   forever. Agents are for open-ended *reads* only.
10. **Secrets live in `.env`**, never in committed files, never printed to logs.

## Architecture

```
src/server.ts      transport — HTTP only: verify secret, allowlist chat, hand off, respond
src/pipeline.ts    use case  — the sequence. No HTTP, no SQL.
src/db/            repository — SQL only. No decisions.
src/telegram.ts    adapter
src/ai/            adapter
src/schema.ts      the contract
migrations/*.sql   schema, applied by src/scripts/migrate.ts
```

Dependency rule: outer imports inner, never the reverse. `pipeline.ts` must not know
HTTP exists.

**The test for "where does this code go?":** *could a cron job call this with no HTTP?*
Not hypothetical — the retry script and the backfill both need exactly that.

---

## Adapting this template to a new domain

When asked to adapt this repo, **interview first, generate second.** Do not guess the
schema from a one-line description.

### Ask these six questions

1. What are you capturing, in one sentence?
2. **What is one record?** (the grain — non-experts usually get this wrong; probe it)
3. Which fields must always be present, and which are optional?
4. **Give me three real messages you would actually send.**
5. What three numbers or charts do you want at the end?
6. What would make a record obviously wrong?

### What each answer produces

| answer | produces |
|---|---|
| 1–2 | table names and the grain |
| 3 | required vs nullable columns, Zod optionality |
| 4 | few-shot examples in the prompt **and** test fixtures |
| 5 | dbt marts and Evidence pages |
| 6 | dbt tests: accepted ranges, `not_null`, uniqueness |

Question 4 is doing double duty deliberately — real user phrasing is both the best
prompt material and the only honest test data.

### Then generate, in this order

1. migration for the new tables (new numbered file — never edit an applied one)
2. Zod schema
3. tool/JSON schema **derived from** the Zod schema
4. prompt, with the user's three real messages as examples
5. starter dbt models and tests
6. starter Evidence pages

### Acceptance check — run it before claiming success

- `bun run migrate` applies cleanly, and applies again as a no-op
- a sample message from question 4 produces a valid row end to end
- a deliberately malformed model output lands in `quarantine`, no crash
- a duplicate delivery inserts nothing
- `dbt build` passes, including the tests from question 6
- the dashboard builds

Generation without verification is the failure mode here. If the checks can't run, the
work isn't finished.

---

## Stack conventions

- **Bun**, not Node. `bun <file>`, `bun add`, `bun test`. `.env` is loaded
  automatically — do not add `dotenv`.
- **`Bun.serve`**, no Express, no Hono. Two routes; conditions are enough.
- **`Bun.sql`** for Postgres, no ORM. Plain SQL in `.sql` files — the schema is the
  content for this audience.
- **Tagged templates vs raw SQL:** `` sql`select ...` `` is fine (static text is SQL);
  `` sql`${fileContents}` `` is not (a `${}` slot is a *parameter*). Raw SQL needs
  `.unsafe()`.
- **Close connections** in scripts, or the process hangs.
- **Ops commands** live in `package.json` scripts, not in shell history.
- Keep the dependency list tiny. It's part of the point.

## When unsure

Ask. This repo's value is in its constraints, and a plausible-looking shortcut that
breaks one of the invariants above is worse than no change at all.
