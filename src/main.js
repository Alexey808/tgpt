import {Markup, Telegraf} from 'telegraf';
import {message} from 'telegraf/filters';
import {yaGptApi} from './api/ya-gpt.api.js';
import {openai} from './api/gpt.api.js';
import {code} from 'telegraf/format';
import config from 'config';
import {
  displayMarkdownMessage,
  displayMessage,
  getUserIdFromAction,
  getUserIdFromCommand,
  getUserIdFromTextEvent
} from "./helpers/main.helper.js";
import {
  getUserModel,
  initUserModels,
  isInitUserModels,
  setUserModel,
} from "./modules/user-models/user-models.js";
import {GPT3_MODEL_INFO, GPT4_MODEL_INFO, GPT_MODEL} from "./constants/gpt-model-info.const.js";
import {YA_GPT_MODEL, YA_GPT_MODEL_INFO} from "./constants/ya-gpt-model.const.js";
import {chatYaGptHandler, getErrorMessageForYaGptModel, getYaMessageArray} from "./helpers/ya-gpt.helper.js";
import {chatGptHandler, getErrorMessageForGptModel, getGptMessageArray} from "./helpers/gpt.helper.js";
import {getUsdRub, initTimeUsdRub, loadUsdRub} from "./modules/currentcy-rate/currency-rate.js";

/** Создание бота */
const bot = new Telegraf(config.get('TELEGRAM_TOKEN'));

/** Подключение сессий (telegraf)*/
// bot.use(session());

/** Предзагрузка данных */
initTimeUsdRub();

/**
 * Команды бота
 */
bot.command('start', async (ctx) => {
  initUserModels(getUserIdFromCommand(ctx));
});

bot.command('usd', async (ctx) => {
  await ctx.reply(`${getUsdRub()}`);
})

bot.command('model', async (ctx) => {
  const modelName = getUserModel(getUserIdFromCommand(ctx));
  await ctx.reply(`${modelName ? modelName : 'Модель ещё не выбрана'}`);
});

bot.command('userId', async (ctx) => {
  await ctx.reply(`${getUserIdFromCommand(ctx)}`);
});

bot.command('load_usd', () => {
  loadUsdRub();
});

bot.command('select_model', async (ctx) => {
  await ctx.reply('Выберите модель:', Markup.inlineKeyboard([
    [Markup.button.callback('GPT-3.5 Turbo', 'selectGpt3')],
    [Markup.button.callback('GPT-4o', 'selectGpt4')],
    [Markup.button.callback('YandexGPT Pro', 'selectYaGpt')],
  ]));
});

/**
 * События бота
 */
bot.action('selectGpt3', async (ctx) => {
  const inputPriceByRub = getUsdRub() ? `(${(GPT3_MODEL_INFO.inputPrice * getUsdRub()).toFixed(3)}₽)` : '';
  const outputPriceByRub = getUsdRub() ? `(${(GPT3_MODEL_INFO.outputPrice * getUsdRub()).toFixed(3)}₽)` : '';
  const data = `**GPT-3.5 Turbo** (gpt-3.5-turbo-0125)
  - стоимость ввода 1000 токенов = ${GPT3_MODEL_INFO.inputPrice}$ ${inputPriceByRub}
  - стоимость вывода 1000 токенов = ${GPT3_MODEL_INFO.outputPrice}$ ${outputPriceByRub}
  - лимит ввода ${GPT3_MODEL_INFO.inputLimit} токенов на вывод
  - лимит вывода ${GPT3_MODEL_INFO.outputLimit} токенов
  _Контекст модели в боте не предусмотрен_`;
  setUserModel(getUserIdFromAction(ctx), GPT_MODEL.GPT3);
  await displayMarkdownMessage(ctx, 'Выбрана модель: ' + data);
});

bot.action('selectGpt4', async (ctx) => {
  const inputPriceByRub = getUsdRub() ? `(${(GPT4_MODEL_INFO.inputPrice * getUsdRub()).toFixed(3)}₽)` : '';
  const outputPriceByRub = getUsdRub() ? `(${(GPT4_MODEL_INFO.outputPrice * getUsdRub()).toFixed(3)}₽)` : '';
  const data = `**GPT-4o** (gpt-4o-2024-05-13)
  - стоимость ввода 1000 токенов = ${GPT4_MODEL_INFO.inputPrice}$ ${inputPriceByRub}
  - стоимость вывода 1000 токенов = ${GPT4_MODEL_INFO.outputPrice}$ ${outputPriceByRub}
  - лимит ввода ${GPT4_MODEL_INFO.inputLimit} токенов на вывод
  - лимит вывода ??? токенов
  _Контекст модели в боте не предусмотрен_`;
  setUserModel(getUserIdFromAction(ctx), GPT_MODEL.GPT4);
  await displayMarkdownMessage(ctx, 'Выбрана модель: ' + data);
});

bot.action('selectYaGpt', async (ctx) => {
  const data = `**YandexGPT** Pro(yandexgpt)
  - стоимость ввода/вывода 1000 токенов = ${YA_GPT_MODEL_INFO.inputOutputPrice}₽  
  - лимит ввода/вывода ${YA_GPT_MODEL_INFO.inputOutputLimit} токенов
  _Контекст модели в боте не предусмотрен_`;
  setUserModel(getUserIdFromAction(ctx), YA_GPT_MODEL.PRO);
  await displayMarkdownMessage(ctx, 'Выбрана модель: ' + data);
});

/**
 * Обработка текстовых событий
 */
bot.on(message('text'), async (ctx) => {
  const userId = getUserIdFromTextEvent(ctx);

  if (!isInitUserModels(userId)) {
    await displayMessage(ctx, 'Выбрана модель по умолчанию GPT-3.5 Turbo, её можно изменить в меню чата', false);
    setUserModel(userId, GPT_MODEL.GPT3);
  }

  const selectedModel = getUserModel(userId);
  await displayMessage(ctx, '...');

  if ([GPT_MODEL.GPT3, GPT_MODEL.GPT4].includes(selectedModel)) {
    /** chat.openai.com */
    try {
      const response = await openai.chat(
        getGptMessageArray(ctx.message.text),
        getUserModel(userId)
      );
      await chatGptHandler(ctx, response, selectedModel);
    } catch (e) {
      await displayMessage(ctx, getErrorMessageForGptModel(e));
    }
  }

  if (selectedModel === YA_GPT_MODEL.PRO) {
    /** yandex-gpt */
    try {
      const response = await yaGptApi.chat(
        getYaMessageArray(ctx.message.text)
      );
      await chatYaGptHandler(ctx, response);
    } catch (e) {
      await displayMessage(ctx, getErrorMessageForYaGptModel(e));
    }
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


async function debugCheckResponseData(ctx, data) {
  return await ctx.reply(
    code(
      JSON.stringify(data, null, 2)
    )
  );
}



