// to start with nodemon, use < npx nodemon scheduleBot.ts >

import { Bot, InlineKeyboard } from "grammy";
import schedule from "node-schedule";
import { connectDB } from "./db/connect";
import {
  findUser,
  getUsers,
  saveUser,
  updateUser,
} from "./db/services/services";

//Create a new bot
const bot = new Bot("6608942688:AAGVsxd6l5ASeP1fbNgV8ZoNcmMxX2_LRQg");
connectDB();

//Pre-assign menu text
const firstMenu =
  "<b>Menu 1</b>\n\nA beautiful menu with a shiny inline button.";
const secondMenu =
  "<b>Menu 2</b>\n\nA better menu with even more shiny inline buttons.";

//Pre-assign button text
const nextButton = "Next";
const backButton = "Back";
const tutorialButton = "Tutorial";

//Build keyboards
const firstMenuMarkup = new InlineKeyboard().text(nextButton, backButton);

const secondMenuMarkup = new InlineKeyboard()
  .text(backButton, backButton)
  .text(tutorialButton, "https://core.telegram.org/bots/tutorial");

//This handler sends a menu with the inline buttons we pre-assigned above
bot.command("menu", async (ctx) => {
  await ctx.reply(firstMenu, {
    parse_mode: "HTML",
    reply_markup: firstMenuMarkup,
  });
});

//This handler processes back button on the menu
bot.callbackQuery(backButton, async (ctx) => {
  //Update message content with corresponding menu section
  await ctx.editMessageText(firstMenu, {
    reply_markup: firstMenuMarkup,
    parse_mode: "HTML",
  });
});

//This handler processes next button on the menu
bot.callbackQuery(nextButton, async (ctx) => {
  //Update message content with corresponding menu section
  await ctx.editMessageText(secondMenu, {
    reply_markup: secondMenuMarkup,
    parse_mode: "HTML",
  });
});

bot.on("message", async (ctx) => {
  console.log(ctx.message);
  console.log(
    `${ctx.from?.first_name} wrote ${
      "text" in ctx.message ? ctx.message.text : ""
    }`
  );

  const userBody = {
    userId: ctx.message.from.id.toString(),
    username: ctx.message.from.username,
    first_name: ctx.message.from.first_name,
    text: {
      text: ctx.message.text,
      date: new Date(ctx.message.date * 1000).toLocaleString('uk-UA'),
    },
  };

  const user = await findUser(userBody.userId);
  if (!user) {
    await saveUser(userBody);
  } else {
    await updateUser(userBody.userId, { $push: { text: userBody.text } });
  }

  if (ctx.message.text) {
    if (
      ctx.message.text === "creator" ||
      ctx.message.text === "author" ||
      ctx.message.text === "developer"
    ) {
      await ctx.reply("https://github.com/PaulHighrow");
      return;
    }

    // console.log(ctx.from.id);
    // await ctx.reply(
    //   `${ctx.from.first_name}, не пиши мені нічого, я читати не вмію!`
    // );
  }

  if (ctx.message.photo) {
    await ctx.reply(
      `${ctx.from.first_name}, тобі показати де інстаграм? https://www.instagram.com/`
    );
  }

  if (ctx.message.animation) {
    await ctx.reply(
      `${ctx.from.first_name}, файна гіфка, йди ще подивись тута https://giphy.com/, а мене в спокою лиши`
    );
  }

  if (ctx.message.video_note || ctx.message?.video) {
    await ctx.reply(`Ти гарнюня, ${ctx.from.first_name}!`);
  }

  if (ctx.message.sticker) {
    await ctx.reply(`Мда, ${ctx.from.first_name}, ото ти клован`);
  }
});

const morningTask = async () => {
  await getUsers()
    .then((resp) =>
      resp.map(
        async (person) =>
          await bot.api.sendMessage(
            person.userId,
            "Привіт, мене просили нагадати, що вебінар стартує через півгодини, долучайтесь!"
          )
      )
    )
    .catch((error) => console.error(error));
};

const eveningtask = async () => {
  await getUsers()
    .then((resp) => {
      resp.map(
        async (person) =>
          await bot.api.sendMessage(
            person.userId,
            "Привіт, мене просили нагадати, що вебінар стартує через півгодини, долучайтесь!"
          )
      );
    })
    .catch((error) => console.error(error));
};

const morningRule = new schedule.RecurrenceRule();
morningRule.dayOfWeek = [new schedule.Range(1, 3)];
morningRule.hour = 8;
morningRule.minute = 30;
morningRule.tz = "Europe/Kyiv";

const eveningRule = new schedule.RecurrenceRule();
eveningRule.dayOfWeek = [new schedule.Range(1, 4)];
eveningRule.hour = 19;
eveningRule.minute = 30;
eveningRule.tz = "Europe/Kyiv";

const morningReminder = schedule.scheduleJob(morningRule, morningTask);
const eveningReminder = schedule.scheduleJob(eveningRule, eveningtask);

//Start the Bot
bot.start();
