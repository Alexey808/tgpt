import {ROLE} from "../constants/model-role.conts.js";
import {YA_GPT_MODEL_INFO} from "../constants/ya-gpt-model.const.js";
import {displayMarkdownMessage, displayMessage} from "./main.helper.js";


/**
 * Формирование сообщения об ошибки в запросах к YaGPT моделям
 * @param event
 * @returns {{errorMessage: string}}
 */
export function getErrorMessageForYaGptModel(event) {
  console.log('Что-то пошло не так: ', event);
  return {
    errorMessage: 'Что-то пошло не так'
  }
}

/**
 * Формирование messages для запроса
 * @param text:string
 * @returns {[{role:ROLE, content:string}]}
 */
export function getYaMessageArray(text) {
  return [{
    role: ROLE.USER,
    content: text
  }]
}

/**
 * Формирует текст пользователю об сложности и цене запроса
 * @param usage:{inputTextTokens:number, completionTokens:number, totalTokens:number}
 * @returns {string}
 */
function getYaGptDisplayMessage(usage) {
  const { inputTextTokens, completionTokens, totalTokens } = usage;
  const inputPrice = inputTextTokens * (YA_GPT_MODEL_INFO.inputOutputPrice/1000);
  const outputPrice = completionTokens * (YA_GPT_MODEL_INFO.inputOutputPrice/1000);
  const sumPrice = inputPrice + outputPrice

  return `Сложность запроса составила: ${totalTokens} токенов (${sumPrice.toFixed(6)}₽)`;
}

/**
 * Обработчик чата для YaGPT модели
 * @param ctx
 * @param response
 * @returns {Promise<void>}
 */
export async function chatYaGptHandler(ctx, response) {
  if (response?.result) {
    const usage = response.result.usage;
    const message = response.result.alternatives[0].message;

    if (usage) {
      await displayMessage(ctx, getYaGptDisplayMessage(usage));
    }
    await displayMarkdownMessage(ctx, message.text);
  } else {
    await displayMessage(ctx, response.errorMessage);
  }
}
