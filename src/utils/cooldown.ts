import { Context } from "telegraf";
const cooldownMs = 2000;
const lastUse = new Map<number, number>();

export type Ctx = Context & {};
export function underCooldown(ctx: Ctx) {
    if (!ctx.from) return false;
    const now = Date.now();
    const prev = lastUse.get(ctx.from.id) || 0;
    if (now - prev < cooldownMs) return true;
    lastUse.set(ctx.from.id, now);
    return false;
}
