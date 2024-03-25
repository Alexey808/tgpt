import { openai } from "./openai.js";
import { code } from "telegraf/format";

export function initSession(ctx) {
  ctx.session = new Map();
}

export function resetUserSession(ctx) {
  if (!!ctx.session) {
    ctx.session.clear();
  }
}

export function checkSession(ctx) {
  if (!ctx.session) {
    initSession(ctx);
  }

  const userId = ctx.message.from.id;
  if (!ctx.session.has(userId)) {
    ctx.session.set(userId, []);
  }
}

export function updateSessionWithUserRole(ctx, isContextOn) {
  const newMessage = {
    role: openai.roles.USER,
    content: ctx.message.text
  };

  if (isContextOn) {
    updateUserSession(ctx, newMessage);
  } else {
    updateUserSessionWithOverwrite(ctx, newMessage);
  }
}

export function updateSessionWithAssistantRole(ctx, content) {
  updateUserSession(ctx, {
    role: openai.roles.ASSISTANT,
    content: content
  });
}

function updateUserSession(ctx, newMessage) {
  const userId = ctx.message.from.id;
  ctx.session.set(
    userId,
    [
      ...ctx.session.get(userId),
      newMessage
    ]
  );
}

function updateUserSessionWithOverwrite(ctx, newMessage) {
  const userId = ctx.message.from.id;
  ctx.session.set(
    userId,
    [newMessage]
  );
}

export function getUserSession(ctx) {
  return ctx.session.get(ctx.message.from.id);
}

export function getUserId(ctx) {
  return ctx.message.from.id;
}

export async function displayMessage(ctx, message, isSystemInfo = true) {
  return await ctx.reply(isSystemInfo ? code(message) : message);
}
