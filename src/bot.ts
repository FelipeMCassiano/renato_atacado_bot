import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import {
    findPhoneById,
    findPhones,
    removeColorFromStock,
} from "./database/repository/repository";
import {
    allColorsInStock,
    atualizarAction,
    atualizarCommandHandler,
    colorsKeyboard,
    colorsText,
    modelsKeyboardFromPhones,
    modelsText,
} from "./handlers/atualizar";
import {
    buildIPhonesMessages,
    formatReply,
    handleIphoneCommand,
} from "./handlers/iphone";
import { isAuthorized } from "./utils/authorized";
import { type Ctx, underCooldown } from "./utils/cooldown";

const TOKEN = process.env.BOT_TOKEN!;
const bot = new Telegraf(TOKEN);
type CommandHandler = (ctx: Ctx, ...args: string[]) => Promise<void> | void;
type CommandDef = {
    restricted?: boolean;
    privateOnly?: boolean;
    handler: CommandHandler;
};

const commands: Record<string, CommandDef> = {
    "!iphone": { handler: handleIphoneCommand },
    "!comandos": {
        handler: async () => {},
    },
    "!atualizar": {
        restricted: true,
        privateOnly: true,
        handler: atualizarCommandHandler,
    },
};

bot.on(message("text"), async (ctx) => {
    const message = ctx.message.text.split(" ");
    if (!message[0]?.startsWith("!")) {
        return;
    }
    if (underCooldown(ctx)) return;

    const command = commands[message[0]!.toLowerCase()];
    if (!command) {
        await ctx.reply(
            `Comando: '${ctx.message.text}' nao existe.\n!comandos para ver todos os comandos disponiveis.`
        );
        return;
    }

    const isRestricted = command.restricted && !isAuthorized(ctx.from.id);

    if (isRestricted) {
        await ctx.reply("⛔ Comando restrito.");
        return;
    }
    const isPrivateOnly = command.privateOnly && ctx.chat?.type !== "private";
    if (isPrivateOnly) {
        await ctx.reply("⛔ Comando somente privado.");
        return;
    }

    await command.handler(ctx, ...message.slice(1));
});

bot.action("att_list", atualizarAction);
bot.action(/^mdl:([^:]+)(?::(.+))?$/, async (ctx) => {
    if (!isAuthorized(ctx.from?.id)) {
        return ctx.answerCbQuery("Acesso negado", { show_alert: true });
    }

    await ctx.answerCbQuery();
    const id = ctx.match[1];
    const brand = ctx.match[2]!;

    const phone = await findPhoneById(id!);
    if (!phone) {
        return ctx.editMessageText(
            "❌ Modelo não encontrado. Tente atualizar a lista de modelos."
        );
    }

    await ctx.editMessageText(colorsText(phone), {
        ...colorsKeyboard(brand, phone),
    });
});
bot.action(/^clr:([^:]+):([a-f\d]{24})$/i, async (ctx) => {
    if (!isAuthorized(ctx.from?.id)) {
        return ctx.answerCbQuery("Acesso negado", { show_alert: true });
    }

    const phoneId = ctx.match[1]!;
    const colorId = ctx.match[2]!;

    const brand = await removeColorFromStock(phoneId, colorId);

    if (!brand) {
        await ctx.answerCbQuery("Modelo ou cor não encontrada.");
        return;
    }

    const phone = brand.phones[0]!;
    const removed = phone.colors.find((c) => c._id.toString() === colorId);

    await ctx.answerCbQuery(`Removido: ${removed?.color}`);

    if (phone.colors.length > 0) {
        await ctx.reply(colorsText(phone), {
            ...colorsKeyboard(brand.name, phone),
        });
    }
});
bot.action(/^back_models:(.+)$/, async (ctx) => {
    if (!isAuthorized(ctx.from?.id)) {
        return ctx.answerCbQuery("Acesso negado", { show_alert: true });
    }
    await ctx.answerCbQuery();
    const brand = ctx.match[1]!;
    const phones = await findPhones({ brandName: brand });
    const available = phones.filter(allColorsInStock);

    await ctx.editMessageText(
        modelsText(brand, available.length),
        modelsKeyboardFromPhones(brand, available)
    );
});
bot.action(/^refresh_models:(.+)$/, async (ctx) => {
    const brand = ctx.match[1]!;
    const { header, body } = await buildIPhonesMessages(brand, []);
    await ctx.answerCbQuery();

    await ctx.editMessageText(formatReply(header!, body!));
});

export default bot;
