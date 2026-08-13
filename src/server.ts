/**
 * Inazuma faucet — a small HTTP service that sends test INAZ.
 *
 *   INAZ_FAUCET_KEY=inazkey1... bun run src/server.ts
 *
 * Endpoints:
 *   GET  /health           -> faucet address, balance, policy
 *   GET  /status/:address  -> claims used, next claim time
 *   POST /claim {address}  -> { hash }
 */
import { InazumaClient, signTransfer, parseInaz, formatInaz, keypairFromSecret, isAddress } from "@inazuma/sdk";
import { ClaimLedger, POLICY } from "./limits";

const secret = process.env.INAZ_FAUCET_KEY;
if (!secret) throw new Error("INAZ_FAUCET_KEY is required (an inazkey1… string).");

const client = new InazumaClient({ url: process.env.INAZ_RPC_URL ?? "https://rpc.inazuma.network" });
const faucet = keypairFromSecret(secret);
const ledger = new ClaimLedger();
const port = Number(process.env.PORT ?? 8787);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

async function balanceRai() {
  return BigInt(await client.getBalance(faucet.address));
}

async function claim(address: string) {
  if (!isAddress(address)) return json({ error: "That is not an Inazuma address." }, 400);

  const blocked = ledger.check(address);
  if (blocked) return json({ error: blocked }, 429);

  const amount = parseInaz(POLICY.amountInaz);
  if ((await balanceRai()) < amount + parseInaz(POLICY.reserveInaz)) {
    return json({ error: "Faucet is empty — it will be refilled shortly." }, 503);
  }

  const account = (await client.getAccount(faucet.address)) as { nonce: number };
  const tx = signTransfer({ secret: secret!, to: address, amountRai: amount, nonce: account.nonce });

  let hash: string;
  try {
    hash = await client.sendTransaction(tx);
  } catch (e) {
    return json({ error: `Chain rejected the transfer: ${(e as Error).message}` }, 502);
  }

  ledger.record(address, hash);
  await client.waitForTransaction(hash).catch(() => undefined);
  return json({ hash, amountInaz: POLICY.amountInaz, address });
}

Bun.serve({
  port,
  async fetch(req) {
    const url = new URL(req.url);

    if (req.method === "GET" && url.pathname === "/health") {
      return json({
        faucet: faucet.address,
        balanceInaz: formatInaz(await balanceRai()),
        policy: POLICY,
      });
    }

    if (req.method === "GET" && url.pathname.startsWith("/status/")) {
      const address = decodeURIComponent(url.pathname.slice("/status/".length));
      const recent = ledger.recent(address);
      return json({
        address,
        claimsUsed: recent.length,
        claimsPerWindow: POLICY.claimsPerWindow,
        blocked: ledger.check(address),
      });
    }

    if (req.method === "POST" && url.pathname === "/claim") {
      const body = (await req.json().catch(() => ({}))) as { address?: string };
      return claim((body.address ?? "").trim());
    }

    return json({ error: "Not found" }, 404);
  },
});

console.log(`Faucet ${faucet.address} listening on :${port}`);
