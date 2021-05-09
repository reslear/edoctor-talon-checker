import { Telegraf } from 'telegraf'

const bot = new Telegraf(process.env.BOT_TOKEN || '')


bot.start((ctx) => ctx.reply('Welcome'))

bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => ctx.reply('Hey there'))


bot.command('restart', () => {
  bot.stop()
  bot.launch()
})

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))