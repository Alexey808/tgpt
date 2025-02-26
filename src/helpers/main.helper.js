import { code } from "telegraf/format";
import telegramifyMarkdown from "telegramify-markdown";

/**
 * Формирование сообщения об ошибки в запросах к моделям
 * @param event
 * @returns {{errorMessage: string}}
 */
export function getErrorMessageFromModel(event) {
  console.log('Что-то пошло не так: ', event);
  return {
    errorMessage: 'Что-то пошло не так'
  }
}

export function getUserIdFromTextEvent(ctx) {
  return ctx.update.message.from.id;
}

export function getUserIdFromAction(ctx) {
  return ctx?.update?.callback_query?.from.id;
}

export function getUserIdFromCommand(ctx) {
  return ctx.update.message.from.id;
}

export async function displayMessage(ctx, message, isSystemInfo = true) {
  return await ctx.reply(isSystemInfo ? code(message) : message);
}

export async function displayMarkdownMessage(ctx, message) {
  const text = telegramifyMarkdown(message);
  return await ctx.replyWithMarkdownV2(text);
}
