import bot from "./bot";
import { seed } from "./database/db";

bot.launch().then(() => console.log("bot online!"));

await seed()
    .then(() => console.log("data seeded"))
    .catch((e) => console.log("eita"));
