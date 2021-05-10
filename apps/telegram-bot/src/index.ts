import express, { Request, Response } from 'express'
import { Telegraf, Markup, Context } from 'telegraf'
import { checkTalon } from 'edoctor-talon-checker'

import { CronosTask, scheduleTask } from 'cronosjs'
let PORT = process.env.PORT || 5000
const WEBHOOK_URL = process.env.WEBHOOK_URL
const BOT_TOKEN = process.env.BOT_TOKEN

if (!WEBHOOK_URL) throw new Error('"WEBHOOK_URL" env var is required!')
if (!BOT_TOKEN) throw new Error('"BOT_TOKEN" env var is required!')

const bot = new Telegraf(BOT_TOKEN)
bot.telegram.setWebhook(WEBHOOK_URL + '/secret-path')

const app = express()

const url = 'http://178.124.171.86:8081/4DACTION/TalonyWeb_TalonyList'
let schedule: CronosTask | null = null

const task = async (ctx: Context) => {
  const { count } = await checkTalon({
    url,
    form_data: { Check25: 'on' },
  })

  if (count > 0) {
    const keyboard = Markup.inlineKeyboard([
      Markup.button.url('Открыть Сайт', url),
    ])

    ctx.replyWithMarkdown(
      `Появились талоны к врачу\nколичество \`${count}\`
    `,
      keyboard
    )
  } else {
    ctx.reply('Талонов нет', { disable_notification: true })
  }
}

bot.start(async (ctx) => {
  ctx.replyWithMarkdown(
    `Привет, начнем?`,
    Markup.keyboard([
      Markup.button.text('/run'),
      Markup.button.text('/stop'),
      Markup.button.text('/check'),

      //
    ]).resize()
  )
})

bot.command('check', async (ctx) => {
  task(ctx)
})

bot.command('run', async (ctx) => {
  if (!schedule) {
    schedule = scheduleTask('*/15 * * * *', () => task(ctx), {
      timezone: 'Europe/Minsk',
    })

    schedule.start()

    ctx.replyWithMarkdown(`✅ Schedule for checking talons success running`)
  }

  task(ctx)
})

bot.command('stop', async (ctx) => {
  if (schedule && schedule.isRunning) {
    schedule.stop()
    ctx.replyWithMarkdown(`🛑 checking stop`)
  } else {
    ctx.replyWithMarkdown('checking not running')
  }
})

app.use(bot.webhookCallback('/secret-path'))

app.listen(PORT, () => {
  console.log('Listening on port', PORT)
})

if (process.env.NODE_ENV === 'development') {
  const exitArr = ['exit', 'uncaughtException', 'SIGINT', 'SIGTERM']
  exitArr.forEach((t) =>
    process.on(t, () => {
      bot.stop()
      process.exit(1)
    })
  )
} else {
  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'))
  process.once('SIGTERM', () => bot.stop('SIGTERM'))
}
