import { Markup } from "telegraf";
import type { Phone } from "../database/models/phone";
import { findPhones } from "../database/repository/repository";
import { isAuthorized } from "../utils/authorized";
import type { Ctx } from "../utils/cooldown";
import { separator } from "./iphone";

export const allColorsInStock = (p: Phone) => p.colors.every((c) => c.inStock);

export async function atualizarCommandHandler(ctx: Ctx, brand: string) {
    const phones = await findPhones({ brandName: brand });
    const available = phones.filter(allColorsInStock);

    await ctx.reply(
        modelsText(brand, available.length),
        modelsKeyboardFromPhones(brand, available)
    );
}

export function modelsText(brand: string, total: number): string {
    return [
        `⚙️ *ATUALIZAÇÃO — Modelos (${brand.toUpperCase()})*`,
        separator,
        total ? `Modelos disponíveis: ${total}` : "Nenhum modelo disponível.",
        separator,
        "_Toque em um modelo para gerenciar as cores._",
    ].join("\n");
}

export function colorsText(phone: Phone): string {
    const qtd = phone.colors.filter((c) => c.inStock).length;
    return [
        `📱 *${phone.modelName}*`,
        separator,
        qtd ? `Cores disponíveis: ${qtd}` : "Sem cores disponíveis.",
        qtd > 0 ? "_Toque em uma cor para removê-la._" : "",
    ].join("\n");
}

export function modelsKeyboardFromPhones(brand: string, phones: Phone[]) {
    const rows = phones.map((p) => [
        Markup.button.callback(p.modelName, `mdl:${p._id}:${brand}`),
    ]);
    rows.push([
        Markup.button.callback(
            "🔄 Atualizar lista de modelos",
            `refresh_models:${brand}`
        ),
    ]);
    return Markup.inlineKeyboard(rows);
}

export function colorsKeyboard(brand: string, phone: Phone) {
    const rows = phone.colors
        .filter((c) => c.inStock)
        .map((color) => [
            Markup.button.callback(
                `🔘 ${color.color}`,
                `clr:${phone._id}:${color._id}`
            ),
        ]);
    rows.push([
        Markup.button.callback("⬅️ Voltar aos modelos", `back_models:${brand}`),
    ]);
    return Markup.inlineKeyboard(rows);
}

export async function atualizarAction(ctx: Ctx) {
    if (!isAuthorized(ctx.from!.id))
        return ctx.answerCbQuery("Acesso negado", { show_alert: true });
    await ctx.answerCbQuery();
}
