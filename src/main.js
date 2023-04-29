import { Telegraf, session } from 'telegraf';
import { message } from 'telegraf/filters';
import { openai } from './openai.js';
import { code } from 'telegraf/format';
import config from 'config';


/** Создание бота */
const bot = new Telegraf(config.get('TELEGRAM_TOKEN'));

/** Подключение сессий */
bot.use(session());

/** Команда бота start */
bot.command('start', async (ctx) => {
  initSession(ctx);
});

/** Команда бота reset по сбросу сессии */
bot.command('reset', async (ctx) => {
  resetUserSession(ctx);
  await ctx.reply(code('Контекст сброшен'));
});

/** Обработка текстовых событий */
bot.on(message('text'), async (ctx) => {
  await ctx.reply(code('...'));
  checkSession(ctx);
  updateSessionWithUserRole(ctx);
  const response = await openai.chat(ctx.session.get(ctx.message.from.id));
  updateSessionWithAssistantRole(ctx, response);
  await ctx.reply(response.content);
});

/** Запуск бота */
bot.launch();

/** Обработка события SIGINT(прерывания) и SIGTERM(завершения), для корректной остановки бота */
process.once('SIGINT', () => bot.store('SIGINT'));
process.once('SIGTERM', () => bot.store('SIGTERM'));


function initSession(ctx) {
  ctx.session = new Map();
}

function resetUserSession(ctx) {
  if (!!ctx.session) {
    ctx.session.clear();
  }
}

function checkSession(ctx) {
  if (!ctx.session) {
    initSession(ctx);
  }

  const userId = ctx.message.from.id;
  if (!ctx.session.has(userId)) {
    ctx.session.set(userId, []);
  }
}

function updateSessionWithUserRole(ctx) {
  updateUserSession(ctx, {
    role: openai.roles.USER,
    content: ctx.message.text
  });
}

function updateSessionWithAssistantRole(ctx, response) {
  updateUserSession(ctx, {
    role: openai.roles.ASSISTANT,
    content: response.content
  });
}

function updateUserSession(ctx, newMessage) {
  const userId = ctx.message.from.id;
  ctx.session.set(
    userId,
    [
      ...ctx.session.get(userId),
      newMessage
    ]
  );
}
