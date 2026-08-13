<h1 align="center">Inazuma Faucet</h1>

<p align="center">
  A small service that hands out test <b>INAZ</b> so anyone can pay fees while
  building on the <a href="https://github.com/inazuma-network/inazuma-core">Inazuma</a> chain.
</p>

---

## Default policy

| | |
| --- | --- |
| Per claim | 2 INAZ |
| Claims per address | 3 per rolling 24 h |
| Gap between claims | 3 hours |
| Reserve | stops serving below 10 INAZ so it never bricks mid-transfer |

Change any of it in [`src/limits.ts`](src/limits.ts).

## Just want test INAZ?

Use the public faucet — paste your address and claim. Nothing to install. If a
claim is refused, the reason is shown (cooldown, daily limit, or empty faucet).
Wallet setup first: [inazuma-wallet](https://github.com/inazuma-network/inazuma-wallet).

## Run your own

```bash
git clone https://github.com/inazuma-network/inazuma-faucet
cd inazuma-faucet
bun install
cp .env.example .env         # then paste your faucet wallet's inazkey1… key
bun run start                # listens on :8787
```

Fund the faucet address printed at startup, then:

```bash
curl localhost:8787/health
curl -X POST localhost:8787/claim -H 'content-type: application/json' \
  -d '{"address":"YOUR_ADDRESS"}'
```

## API

| Method | Path | Returns |
| --- | --- | --- |
| `GET` | `/health` | Faucet address, balance, active policy |
| `GET` | `/status/:address` | Claims used, whether the address is currently blocked |
| `POST` | `/claim` `{ address }` | `{ hash, amountInaz }` or an error with a reason |

Status codes: `400` bad address, `429` rate limited (with reason), `502` chain
rejected the transfer, `503` faucet empty.

## Before you expose it publicly

- **Persist the ledger.** `ClaimLedger` is in memory; a restart resets limits and
  the faucet gets drained. Swap it for your database (one row per claim: address,
  timestamp, hash).
- **Rate limit by IP too**, at your proxy. Address limits alone are cheap to bypass
  by generating new addresses.
- **Keep the balance small.** Top it up on a schedule rather than parking a
  treasury in a hot key.
- **Never log the key** or return it in an error.
- Add a captcha or a GitHub-login gate if bots become a problem.

## Ecosystem

| Repo | Purpose |
| --- | --- |
| [inazuma-core](https://github.com/inazuma-network/inazuma-core) | The Rust L1 node |
| [inazuma-sdk](https://github.com/inazuma-network/inazuma-sdk) | TypeScript SDK used by this service |
| [inazuma-wallet](https://github.com/inazuma-network/inazuma-wallet) | Wallet extension |
| [inazuma-docs](https://github.com/inazuma-network/inazuma-docs) | Network documentation |
| [inazuma-faucet](https://github.com/inazuma-network/inazuma-faucet) | This repo |
| [inazuma-contracts](https://github.com/inazuma-network/inazuma-contracts) | WASM contract examples |

MIT licensed.
