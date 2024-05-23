import { code } from "telegraf/format";
import telegramifyMarkdown from "telegramify-markdown";

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
