/** Claim policy — change these numbers to run a different faucet. */
export const POLICY = {
  /** INAZ handed out per claim. */
  amountInaz: "2",
  /** Maximum claims per address inside the rolling window. */
  claimsPerWindow: 3,
  /** Rolling window length. */
  windowMs: 24 * 60 * 60 * 1000,
  /** Minimum gap between two claims by the same address. */
  cooldownMs: 3 * 60 * 60 * 1000,
  /** Refuse to serve when the faucet wallet drops below this many INAZ. */
  reserveInaz: "10",
} as const;

export type ClaimRecord = { address: string; at: number; hash: string };

/**
 * In-memory claim ledger. Swap `load`/`save` for your database in production —
 * restarts must not reset limits, or the faucet is trivially drained.
 */
export class ClaimLedger {
  private records: ClaimRecord[] = [];

  recent(address: string): ClaimRecord[] {
    const since = Date.now() - POLICY.windowMs;
    return this.records.filter((r) => r.address === address && r.at >= since);
  }

  /** Returns null when allowed, or a human-readable reason when blocked. */
  check(address: string): string | null {
    const recent = this.recent(address);
    if (recent.length >= POLICY.claimsPerWindow) {
      const resetsIn = recent[recent.length - 1]!.at + POLICY.windowMs - Date.now();
      return `Daily limit reached (${POLICY.claimsPerWindow} claims). Try again in ${minutes(resetsIn)}.`;
    }
    const last = recent[0]?.at ?? 0;
    const wait = last + POLICY.cooldownMs - Date.now();
    if (wait > 0) return `Cooldown active. Try again in ${minutes(wait)}.`;
    return null;
  }

  record(address: string, hash: string) {
    this.records.unshift({ address, at: Date.now(), hash });
  }
}

const minutes = (ms: number) => `${Math.max(1, Math.ceil(ms / 60_000))} min`;
