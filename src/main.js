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
import { yaGptApi } from './api/ya-gpt-service-api.js';


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
bot.command('context_on', async (ctx) => {
  setIsContextByUserId(getUserId(ctx), true);
  await ctx.reply(code('Контекст включен'));
});
bot.command('context_off', async (ctx) => {
  setIsContextByUserId(getUserId(ctx), false);
  await ctx.reply(code('Контекст выключен'));
});

/** Обработка текстовых событий */
bot.on(message('text'), async (ctx) => {
    const isContext = getIsContextByUserId(getUserId(ctx));

    await displayMessage(ctx, '...');

    checkSession(ctx);
    updateSessionWithUserRole(ctx, isContext);


    /** chat.openai.com */
    // const response = await openai.chat(getUserSession(ctx));
    // this.debugCheckResponseData(ctx, response);
    // await chatOpenaiHandler(ctx, isContext, response);

    /** chat.gpt4free.io */
    // const response = await demoGpt.chat(getUserSession(ctx));
    // await chatGptFreeHandler(ctx, isContext, response);

    /** yandex-gpt */
    // const response = await yaGptApi.chat(getUserSession(ctx));
    // console.log('main > response > ', response);
    // await chatYaGptHandler(ctx, isContext, response);
});

async function chatYaGptHandler(ctx, isContext, response) {
  await displayMessage(ctx, JSON.stringify(response));
  // if (response?.success) {
  //   await displayMessage(ctx, JSON.stringify(response));
  // } else {
  //   await displayMessage(ctx, JSON.stringify(response));
  // }
}

async function chatGptFreeHandler(ctx, isContext, response) {
  if (response?.success) {
    const totalTokens = response.usage.total_tokens;
    const textContent = response.reply;

    await displayMessage(ctx, `Сложность запроса составила: ${totalTokens}`);

    if (isContext) {
      updateSessionWithAssistantRole(ctx, textContent);
    }

    await displayMessage(ctx, textContent, false);
  } else {
    await displayMessage(ctx, JSON.stringify(response));
  }
}

async function chatOpenaiHandler(ctx, isContext, response) {
  if (response?.data) {
    const totalTokens = response.data?.usage.total_tokens;
    const message = response.data?.choices[0].message;

    await displayMessage(ctx, `Сложность запроса составила: ${totalTokens} токенов из ${4096}`);

    if (isContext) {
      updateSessionWithAssistantRole(ctx, message.content);
    }

    await displayMessage(ctx, message.content, false);
  } else {
    await displayMessage(ctx, response.errorMessage);
  }
}


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



