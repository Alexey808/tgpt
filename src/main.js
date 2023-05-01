import { Telegraf, session } from 'telegraf';
import { message } from 'telegraf/filters';
import { openai } from './openai.js';
import { code } from 'telegraf/format';
import config from 'config';
import {
  checkSession,
  getUserSession,
  initSession,
  resetUserSession,
  updateSessionWithAssistantRole,
  updateSessionWithUserRole
} from "./main-helper.js";
import { botSettings } from "./bot-settings.js";



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
  botSettings.isContext = true;
  await ctx.reply(code('Контекст включен'));
});
bot.command('off_context', async (ctx) => {
  botSettings.isContext = false;
  await ctx.reply(code('Контекст выключен'));
});

/** Обработка текстовых событий */
bot.on(message('text'), async (ctx) => {
  await ctx.reply(code('...'));
  checkSession(ctx);
  updateSessionWithUserRole(ctx, botSettings.isContext);
  const response = await openai.chat(getUserSession(ctx));
  if (botSettings.isContext) {
    updateSessionWithAssistantRole(ctx, response);
  }
  await ctx.reply(response.content);
});


/** Запуск бота */
bot.launch();
console.info('------------------------------');
console.info('env:', config.get('ENV_NAME'));
console.info('context:', botSettings.isContext);
console.info('------------------------------');


/** Обработка события SIGINT(прерывания) и SIGTERM(завершения), для корректной остановки бота */
process.once('SIGINT', () => bot.store('SIGINT'));
process.once('SIGTERM', () => bot.store('SIGTERM'));



