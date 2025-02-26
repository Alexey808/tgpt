import {ROLE} from "../constants/model-role.conts.js";
import {GPT3_MODEL_INFO, GPT4_MODEL_INFO, GPT_MODEL} from "../constants/gpt-model-info.const.js";
import {displayMarkdownMessage, displayMessage} from "./main.helper.js";


/**
 * Формирование messages для запроса
 */
export function getGeminiMessageArray(text) {
  return [{
    text
  }]
}

/**
 * Обработчкик чата для Gemini GPT моделей
 * @param ctx
 * @param response
 * @param selectedModel:GPT_MODEL
 * @returns {Promise<void>}
 */
export async function chatGeminiGptHandler(ctx, response, selectedModel) {
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
