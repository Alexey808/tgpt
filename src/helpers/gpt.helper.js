import {ROLE} from "../constants/model-role.conts.js";
import {GPT3_MODEL_INFO, GPT4_MODEL_INFO, GPT_MODEL} from "../constants/gpt-model-info.const.js";
import {displayMarkdownMessage, displayMessage} from "./main.helper.js";
import {getUsdRub} from "../modules/currentcy-rate/currency-rate.js";


/**
 * Формирование сообщения об ошибки в запросах к GPT моделям
 * @param event
 * @returns {{errorMessage: string}}
 */
export function getErrorMessageForGptModel(event) {
  if (event?.status === 429) {
    return {
      errorMessage: 'Превышен лимит запросов в единицу времени'
    }
  } else {
    console.log('Что-то пошло не так: ', event);
    return {
      errorMessage: 'Что-то пошло не так'
    }
  }
}

/**
 * Формирование messages для запроса
 * @param text:string
 * @returns {[{role:ROLE, content:string}]}
 */
export function getGptMessageArray(text) {
  return [{
    role: ROLE.USER,
    content: text
  }]
}

/**
 * Формирует текст пользователю об сложности и цене запроса
 * @param usage:{prompt_tokens:number, completion_tokens:number, total_tokens:number}
 * @param modelInfo:GPT4_MODEL_INFO
 * @returns {string}
 */
function getGptDisplayMessage(usage, modelInfo) {
  const usd = getUsdRub() || null;
  const { prompt_tokens, completion_tokens, total_tokens } = usage;
  const inputPrice = prompt_tokens * (modelInfo.inputPrice/1000);
  const outputPrice = completion_tokens * (modelInfo.outputPrice/1000);
  const sumPriceByUsd = inputPrice + outputPrice;
  const sumPriceByRub = (inputPrice + outputPrice) * getUsdRub();
  const sumPrice = usd ? `${sumPriceByRub.toFixed(6)}₽` : `${sumPriceByUsd.toFixed(6)}$`

  return `Сложность запроса составила: ${total_tokens} токенов (${sumPrice})`;
}

/**
 * Обработчкик чата для GPT моделей
 * @param ctx
 * @param response
 * @param selectedModel:GPT_MODEL
 * @returns {Promise<void>}
 */
export async function chatGptHandler(ctx, response, selectedModel) {
  if (response?.data) {
    const usage = response.data?.usage;
    const message = response.data?.choices[0].message;
    if (usage) {
      if (selectedModel === GPT_MODEL.GPT3) {
        await displayMessage(ctx, getGptDisplayMessage(usage, GPT3_MODEL_INFO));
      }
      if (selectedModel === GPT_MODEL.GPT4) {
        await displayMessage(ctx, getGptDisplayMessage(usage, GPT4_MODEL_INFO));
      }
    }
    await displayMarkdownMessage(ctx, message.content, false);
  } else {
    await displayMessage(ctx, response.errorMessage);
  }
}
