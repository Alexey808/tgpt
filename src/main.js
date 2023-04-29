import { Telegraf, session } from 'telegraf';
import { message } from 'telegraf/filters';
import { openai } from './openai.js';
import { code } from 'telegraf/format';
import config from 'config';

const INITIAL_SESSION = {
  messages: [],
}

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'));

bot.use(session());

bot.command('start', async (ctx) => {
  ctx.session = INITIAL_SESSION;
})

bot.command('new', async (ctx) => {
  ctx.session.messages = [];
  await ctx.reply(code('Контекст сброшен'));
})

bot.on(message('text'), async (ctx) => {
  await ctx.reply(code('...'));
  ctx.session ??= INITIAL_SESSION;
  ctx.session.messages.push({ role: openai.roles.USER, content: ctx.message.text });
  const response = await openai.chat(ctx.session.messages);
  ctx.session.messages.push({ role: openai.roles.ASSISTANT, content: response.content });
  // await ctx.reply(JSON.stringify(ctx.message, null, 2));
  await ctx.reply(response.content);
})


bot.launch();

process.once('SIGINT', () => bot.store('SIGINT'))
process.once('SIGTERM', () => bot.store('SIGTERM'))
