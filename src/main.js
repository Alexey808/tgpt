import {Markup, Telegraf} from 'telegraf';
import {message} from 'telegraf/filters';
import {yaGptApi} from './api/ya-gpt.api.js';
import {openai} from './api/gpt.api.js';
import {code} from 'telegraf/format';
import config from 'config';
import {
  displayMarkdownMessage,
  displayMessage, getErrorMessageFromModel,
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
import {YA_GPT5_MODEL_INFO, YA_GPT_MODEL, YA_GPT_MODEL_INFO} from "./constants/ya-gpt-model.const.js";
import {chatYaGptHandler, getYaMessageArray} from "./helpers/ya-gpt.helper.js";
import {chatGptHandler, getErrorMessageForGptModel, getGptMessageArray} from "./helpers/gpt.helper.js";
import {getUsdRub, initTimeUsdRub, loadUsdRub} from "./modules/currentcy-rate/currency-rate.js";
import {GEMINI_GPT_MODEL} from "./constants/gemini-gpt-model.const.js";
import {LLAMA_LITE_MODEL_INFO, LLAMA_MODEL, LLAMA_MODEL_INFO} from "./constants/lama-model.const.js";
import {chatLlamaHandler, getLlamaMessageArray} from "./helpers/llama.helper.js";
import {llamaApi} from "./api/llama.api.js";

const Button = {
  'selectGpt3': 'selectGpt3',
  'selectGpt4': 'selectGpt4',
  'selectYaGpt4': 'selectYaGpt4',
  'selectYaGpt5': 'selectYaGpt5',
  'llamaLite': 'llamaLite',
  'llama': 'llama',
}

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

bot.command('user_id', async (ctx) => {
  await ctx.reply(`${getUserIdFromCommand(ctx)}`);
});

bot.command('load_usd', () => {
  loadUsdRub();
});

bot.command('help', async (ctx) => {
  await ctx.reply(`Команды:
  start - запуск бота
  usd - курс доллара который учавствует в подсчёте стоимости запроса
  model - показывает какая модель выбрана
  user_id - показать id пользователя
  load_usd - загрузить/обновить курс доллара
  `);
});

bot.command('select_model', async (ctx) => {
  await ctx.reply('Выберите модель:', Markup.inlineKeyboard([
    [Markup.button.callback('GPT-3.5 Turbo', Button.selectGpt3)],
    [Markup.button.callback('GPT-4o', Button.selectGpt4)],
    // [Markup.button.callback('Gemini-1.5-pro', 'selectGeminiGptPro')],
    // [Markup.button.callback('Gemini-1.5-flash', 'selectGeminiGptFlash')],
    [Markup.button.callback('YandexGPT 4 Pro (latest)', Button.selectYaGpt4)],
    [Markup.button.callback('YandexGPT 5 Pro (rc)', Button.selectYaGpt5)],
    [Markup.button.callback('llama-lite (8b)', Button.llamaLite)],
    [Markup.button.callback('llama (70b)', Button.llama)],
  ]));
});

/**
 * События бота
 */
bot.action(Button.selectGpt3, async (ctx) => {
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

bot.action(Button.selectGpt4, async (ctx) => {
  const inputPriceByRub = getUsdRub() ? `(${(GPT4_MODEL_INFO.inputPrice * getUsdRub()).toFixed(3)}₽)` : '';
  const outputPriceByRub = getUsdRub() ? `(${(GPT4_MODEL_INFO.outputPrice * getUsdRub()).toFixed(3)}₽)` : '';
  const data = `**GPT-4o** (gpt-4o-2024-05-13)
  - стоимость ввода 1000 токенов = ${GPT4_MODEL_INFO.inputPrice}$ ${inputPriceByRub}
  - стоимость вывода 1000 токенов = ${GPT4_MODEL_INFO.outputPrice}$ ${outputPriceByRub}
  - лимит ввода ${GPT4_MODEL_INFO.inputLimit} токенов
  - лимит вывода ??? токенов
  _Контекст модели в боте не предусмотрен_`;
  setUserModel(getUserIdFromAction(ctx), GPT_MODEL.GPT4);
  await displayMarkdownMessage(ctx, 'Выбрана модель: ' + data);
});

// bot.action('selectGeminiGptPro', async (ctx) => {
//   const inputPriceByRub = getUsdRub() ? `(${(GEMINI_1_5_PRO_INFO.inputPrice * getUsdRub()).toFixed(3)}₽)` : '';
//   const outputPriceByRub = getUsdRub() ? `(${(GEMINI_1_5_PRO_INFO.outputPrice * getUsdRub()).toFixed(3)}₽)` : '';
//   const data = `**Gemini 1.5 Pro** (gemini-1.5-pro)
//   - стоимость ввода 1000 токенов = ${GEMINI_1_5_PRO_INFO.inputPrice}$ ${inputPriceByRub}
//   - стоимость вывода 1000 токенов = ${GEMINI_1_5_PRO_INFO.outputPrice}$ ${outputPriceByRub}
//   - лимит ввода ${GEMINI_1_5_PRO_INFO.inputLimit} токенов
//   - лимит вывода ${GEMINI_1_5_PRO_INFO.outputLimit} токенов
//   _Контекст модели в боте не предусмотрен_`;
//   setUserModel(getUserIdFromAction(ctx), GEMINI_GPT_MODEL.GEMINI_1_5_PRO);
//   await displayMarkdownMessage(ctx, 'Выбрана модель: ' + data);
// });

// bot.action('selectGeminiGptFlash', async (ctx) => {
//   const inputPriceByRub = getUsdRub() ? `(${(GEMINI_1_5_FLASH_INFO.inputPrice * getUsdRub()).toFixed(3)}₽)` : '';
//   const outputPriceByRub = getUsdRub() ? `(${(GEMINI_1_5_FLASH_INFO.outputPrice * getUsdRub()).toFixed(3)}₽)` : '';
//   const data = `**Gemini 1.5 Pro** (gemini-1.5-pro)
//   - стоимость ввода 1000 токенов = ${GEMINI_1_5_FLASH_INFO.inputPrice}$ ${inputPriceByRub}
//   - стоимость вывода 1000 токенов = ${GEMINI_1_5_FLASH_INFO.outputPrice}$ ${outputPriceByRub}
//   - лимит ввода ${GEMINI_1_5_FLASH_INFO.inputLimit} токенов
//   - лимит вывода ${GEMINI_1_5_FLASH_INFO.outputLimit} токенов
//   _Контекст модели в боте не предусмотрен_`;
//   setUserModel(getUserIdFromAction(ctx), GEMINI_GPT_MODEL.GEMINI_1_5_FLASH);
//   await displayMarkdownMessage(ctx, 'Выбрана модель: ' + data);
// });

bot.action(Button.selectYaGpt4, async (ctx) => {
  const data = `**Yandex GPT 4** Pro (latest)
  - стоимость ввода/вывода 1000 токенов = ${YA_GPT_MODEL_INFO.inputOutputPrice}₽  
  - лимит ввода/вывода ${YA_GPT_MODEL_INFO.inputOutputLimit} токенов
  _Контекст модели в боте не предусмотрен_`;
  setUserModel(getUserIdFromAction(ctx), YA_GPT_MODEL.PRO);
  await displayMarkdownMessage(ctx, 'Выбрана модель: ' + data);
});

bot.action(Button.selectYaGpt5, async (ctx) => {
  const data = `**Yandex GPT 5** Pro (rc)
  - стоимость ввода/вывода 1000 токенов = ${YA_GPT5_MODEL_INFO.inputOutputPrice}₽  
  - лимит ввода/вывода ${YA_GPT5_MODEL_INFO.inputOutputLimit} токенов
  _Контекст модели в боте не предусмотрен_`;
  setUserModel(getUserIdFromAction(ctx), YA_GPT_MODEL.PRO_RC);
  await displayMarkdownMessage(ctx, 'Выбрана модель: ' + data);
});

bot.action(Button.llamaLite, async (ctx) => {
  const data = `**llama-lite**
  - стоимость ввода/вывода 1000 токенов = ${LLAMA_LITE_MODEL_INFO.inputOutputPrice}₽  
  - лимит ввода/вывода ${LLAMA_LITE_MODEL_INFO.inputOutputLimit} токенов
  _Контекст модели в боте не предусмотрен_`;
  setUserModel(getUserIdFromAction(ctx), LLAMA_MODEL.LAMA8B);
  await displayMarkdownMessage(ctx, 'Выбрана модель: ' + data);
});

bot.action(Button.llama, async (ctx) => {
  const data = `**llama**
  - стоимость ввода/вывода 1000 токенов = ${LLAMA_MODEL_INFO.inputOutputPrice}₽  
  - лимит ввода/вывода ${LLAMA_MODEL_INFO.inputOutputLimit} токенов
  _Контекст модели в боте не предусмотрен_`;
  setUserModel(getUserIdFromAction(ctx), LLAMA_MODEL.LAMA70B);
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
    /** openai-gpt */
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

  if ([YA_GPT_MODEL.PRO, YA_GPT_MODEL.PRO_RC].includes(selectedModel)) {
    /** yandex-gpt */
    try {
      const response = await yaGptApi.chat(
        getYaMessageArray(ctx.message.text),
        selectedModel === YA_GPT_MODEL.PRO_RC
      );
      await chatYaGptHandler(ctx, response);
    } catch (e) {
      await displayMessage(ctx, getErrorMessageFromModel(e));
    }
  }

  if ([LLAMA_MODEL.LAMA8B, LLAMA_MODEL.LAMA70B].includes(selectedModel)) {
    /** llama */
    try {
      const modelInfo = selectedModel === LLAMA_MODEL.LAMA70B
        ? LLAMA_MODEL_INFO
        : LLAMA_LITE_MODEL_INFO;

      const response = await llamaApi.chat(
        getLlamaMessageArray(ctx.message.text),
        selectedModel,
        modelInfo
      );

      await chatLlamaHandler(ctx, response, modelInfo);
    } catch (e) {
      await displayMessage(ctx, getErrorMessageFromModel(e));
    }
  }

  if ([GEMINI_GPT_MODEL.GEMINI_1_5_PRO, GEMINI_GPT_MODEL.GEMINI_1_5_FLASH].includes(selectedModel)) {
    /** google-gpt */
    // try {
    //   const response = await geminiGptApi.chat(
    //     getGeminiMessageArray(ctx.message.text),
    //     getUserModel(userId)
    //   );
    //   console.log('response -> ', response);
    //   // await chatGeminiGptHandler(ctx, response, selectedModel);
    // } catch (e) {
    //   await displayMessage(ctx, getErrorMessageForGeminiGptModel(e))
    // }
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



