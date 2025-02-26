import {ROLE} from "../constants/model-role.conts.js";
import {YA_GPT_MODEL_INFO} from "../constants/ya-gpt-model.const.js";
import {displayMarkdownMessage, displayMessage} from "./main.helper.js";


/**
 * Формирование messages для запроса
 * @param text:string
 * @returns {[{role:ROLE, content:string}]}
 */
export function getLlamaMessageArray(text) {
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
function getLlamaDisplayMessage(usage, modelInfo) {
  const { inputTextTokens, completionTokens, totalTokens } = usage;

  const inputPrice = inputTextTokens * (modelInfo.inputOutputPrice/1000);
  const outputPrice = completionTokens * (modelInfo.inputOutputPrice/1000);
  const sumPrice = inputPrice + outputPrice

  return `Сложность запроса составила: ${totalTokens} токенов (${sumPrice.toFixed(6)}₽)`;
}

/**
 * Обработчик чата
 * @param ctx
 * @param response
 * @returns {Promise<void>}
 */
export async function chatLlamaHandler(ctx, response, modelInfo) {
  if (response?.result) {
    const usage = response.result.usage;
    const message = response.result.alternatives[0].message;

    if (usage) {
      await displayMessage(ctx, getLlamaDisplayMessage(usage, modelInfo));
    }
    await displayMarkdownMessage(ctx, message.text);
  } else {
    await displayMessage(ctx, response.errorMessage);
  }
}
