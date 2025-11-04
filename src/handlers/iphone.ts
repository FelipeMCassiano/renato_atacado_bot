import { Enumerable } from "qinn";
import { findPhones } from "../database/repository/repository";
import type { Ctx } from "../utils/cooldown";
export const separator = "————————-———————-";

export function formatReply(header: string, body: string): string {
    return `${header}\n${body}`;
}

export async function handleIphoneCommand(
    ctx: Ctx,
    ...colors: string[]
): Promise<void> {
    const data = await buildIPhonesMessages("apple", colors);
    const { header, body, label } = data;
    if (label) {
        ctx.reply(`Nenhum IPhone encontrado para cor(es): ${label}.`);
        return;
    }
    ctx.reply(formatReply(header!, body!));
}

export async function buildIPhonesMessages(
    brand: string,
    colors: string[]
): Promise<{ header?: string; body?: string; label?: string }> {
    const items = await findPhones({ brandName: brand, colors: colors });

    if (items.length === 0) {
        const label = colors.length ? colors.join(", ") : "";
        return { label: label };
    }

    const header = [
        "🍏LISTA IPHONE🍏",
        "",
        "LACRADOS COM (1 ANO DE GARANTIA)",
        separator,
    ].join("\n");

    const body = Enumerable.from(items)
        .where((p) => Enumerable.from(p.colors).all((c) => c.inStock))
        .select((i) => {
            const msgColors = i.colors
                .map(
                    (colors) =>
                        `🔘${colors.color.toUpperCase()}\n💵R$${i.price.toLocaleString(
                            "pt-BR"
                        )}`
                )
                .join("\n");
            return `*📱${i.modelName.toUpperCase()}*\n${msgColors}`;
        })
        .toArray()
        .join(`\n${separator}\n`);

    return { header: header, body: body };
}
