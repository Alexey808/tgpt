import { session, Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { openai } from './openai.js';
import { code } from 'telegraf/format';
import config from 'config';
import {
  checkSession,
  displayMessage,
  getUserId,
  getUserSession,
  initSession,
  resetUserSession,
  updateSessionWithAssistantRole,
  updateSessionWithUserRole
} from "./main-helper.js";
import {
  getIsContextByUserId,
  setIsContextByUserId
} from "./personal-bot-settings.js";


/** Создание бота */
const bot = new Telegraf(config.get('TELEGRAM_TOKEN'));

/** Подключение сессий*/
bot.use(session());

/**
 * Команды бота
 */
bot.command('start', async (ctx) => {
  initSession(ctx);
});
bot.command('reset', async (ctx) => {
  resetUserSession(ctx);
  await ctx.reply(code('Контекст сброшен'));
});
bot.command('on_context', async (ctx) => {
  setIsContextByUserId(getUserId(ctx), true);
  await ctx.reply(code('Контекст включен'));
});
bot.command('off_context', async (ctx) => {
  setIsContextByUserId(getUserId(ctx), false);
  await ctx.reply(code('Контекст выключен'));
});

/** Обработка текстовых событий */
bot.on(message('text'), async (ctx) => {
  const isContext = getIsContextByUserId(getUserId(ctx));

  await displayMessage(ctx, '...');

  checkSession(ctx);
  updateSessionWithUserRole(ctx, isContext);

  const response = await openai.chat(getUserSession(ctx));

  if (response?.data) {
    const totalTokens = response.data?.usage.total_tokens;
    const message = response.data?.choices[0].message;

    await displayMessage(ctx, `Сложность запроса составила: ${totalTokens} токенов из ${4096}`);

    if (isContext) {
      updateSessionWithAssistantRole(ctx, message);
    }

    await displayMessage(ctx, message.content, false);
  } else {
    await displayMessage(ctx, response.errorMessage);
  }
});


/** Запуск бота */
bot.launch();
console.info('------------------------------');
console.info('env:', config.get('ENV_NAME'));
console.info('------------------------------');


/** Обработка события SIGINT(прерывания) и SIGTERM(завершения), для корректной остановки бота */
process.once('SIGINT', () => bot.store('SIGINT'));
process.once('SIGTERM', () => bot.store('SIGTERM'));



async function debugCheckContextLength(ctx) {
  return await ctx.reply(
    code(
      JSON.stringify('Длина контекста: ' + getUserSession(ctx).length, null, 2)
    )
  );
}

async function debugCheckResponseData(ctx, data) {
  return await ctx.reply(
    code(
      JSON.stringify(data, null, 2)
    )
  );
}



