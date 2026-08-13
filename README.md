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

---

## Why Inazuma exists

Inazuma is a sovereign layer 1 — our own consensus, state machine, networking and VM, not
a rollup or a fork. The goal is narrow and deliberate: **be the home chain for memes,
NFTs, collectibles, games and communities.**

That use case is high volume and low value per transaction. A 500-piece mint, a game
writing a move a second, a community handing out collectibles — none of them can pay
dollars in fees or wait seconds for a confirmation. So the whole design is bent around
being fast and near-free:

| | |
| --- | --- |
| Block time | 400 ms, finalised in the same block |
| Transfer fee | ~0.000001 INAZ — fractions of a cent |
| Throughput | ~2,500 tx/s ingest; 20k-36k tx/s execution in bench |
| Tokens & NFTs | first-class chain records — no contract needed to mint |
| Contracts | gas-metered WASM |
| Accounts | Ed25519, base58 addresses, optional ML-DSA-65 co-signature |
| Light clients | sparse Merkle state proofs |

Getting to top-tier means three things, in this order: enough independent validators that
nobody can stop the chain, tooling good enough that a first-time builder ships in an
afternoon, and fees that stay boring even when a collection goes viral. Every repo below
is one part of that.

## The Inazuma repos

| Repo | What's in it |
| --- | --- |
| [inazuma-core](https://github.com/inazuma-network/inazuma-core) | The Rust L1: consensus, state, staking, P2P, JSON-RPC, WASM VM |
| [inazuma-validator](https://github.com/inazuma-network/inazuma-validator) | Node operators: one-command installer, systemd units, health checks, full guide |
| [inazuma-sdk](https://github.com/inazuma-network/inazuma-sdk) | TypeScript client: RPC, keys, signing, sign-in, state proofs |
| [inazuma-wallet](https://github.com/inazuma-network/inazuma-wallet) | Self-custody wallet: browser extension, web and Android |
| [inazuma-contracts](https://github.com/inazuma-network/inazuma-contracts) | WASM contract examples, host ABI and deploy scripts |
| **inazuma-faucet** (here) | Test-token faucet service |
| [inazuma-docs](https://github.com/inazuma-network/inazuma-docs) | All written guides, organised by role |
| [inazuma-improvement-proposals](https://github.com/inazuma-network/inazuma-improvement-proposals) | INAZIPs — how the chain changes |

## Getting started, whoever you are

| I want to… | Go to |
| --- | --- |
| Use a wallet and send INAZ | [inazuma-wallet](https://github.com/inazuma-network/inazuma-wallet) |
| Get test INAZ | [inazuma-faucet](https://github.com/inazuma-network/inazuma-faucet) |
| Build an app | [inazuma-sdk](https://github.com/inazuma-network/inazuma-sdk) · [inazuma-contracts](https://github.com/inazuma-network/inazuma-contracts) |
| Run a node or stake | [inazuma-validator](https://github.com/inazuma-network/inazuma-validator) |
| Understand the internals | [inazuma-core](https://github.com/inazuma-network/inazuma-core) |
| Propose a protocol change | [INAZIPs](https://github.com/inazuma-network/inazuma-improvement-proposals) |
