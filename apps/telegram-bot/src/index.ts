import express, { Request, Response } from 'express'
import { Telegraf, Markup, Context } from 'telegraf'

import LocalSession from 'telegraf-session-local'

import { checkTalon } from 'edoctor-talon-checker'
import { CronosTask, scheduleTask } from 'cronosjs'
import dayjs from 'dayjs'

let PORT = process.env.PORT || 5000
const WEBHOOK_URL = process.env.WEBHOOK_URL
const BOT_TOKEN = process.env.BOT_TOKEN

if (!WEBHOOK_URL) throw new Error('"WEBHOOK_URL" env var is required!')
if (!BOT_TOKEN) throw new Error('"BOT_TOKEN" env var is required!')

// Define your own context type

interface Log {
  [DATE: string]: { time: string; count: number }[]
}
interface MyContext extends Context {
  session: {
    log: Log
  }
}

const bot = new Telegraf<MyContext>(BOT_TOKEN)
bot.telegram.setWebhook(WEBHOOK_URL + '/secret-path')

bot.use(
  new LocalSession({
    database: 'db.json',
  }).middleware()
)

const app = express()

const url = 'http://178.124.171.86:8081/4DACTION/TalonyWeb_TalonyList'
let schedule: CronosTask | null = null

const task = async (ctx: MyContext, { show_no_talon = false } = {}) => {
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
    if (show_no_talon) {
      ctx.reply('Талонов нет', { disable_notification: true })
    }
  }

  return { count }
}

bot.start(async (ctx) => {
  ctx.replyWithMarkdown(
    `Привет, начнем?`,
    Markup.keyboard([
      Markup.button.text('/run'),
      Markup.button.text('/stop'),
      Markup.button.text('/check'),
      Markup.button.text('/stats'),
      Markup.button.text('/delete'),
    ]).resize()
  )
})

bot.command('check', async (ctx, next) => {
  ctx.session.log = ctx.session.log || {}

  const { count } = await task(ctx, { show_no_talon: true })

  const dateKey = dayjs().format('DD.MM.YY')
  if (!ctx.session.log[dateKey]) ctx.session.log[dateKey] = []

  ctx.session.log[dateKey].push({
    time: dayjs().format('HH:mm'),
    count,
  })
})

bot.command('run', async (ctx) => {
  if (!schedule) {
    schedule = scheduleTask('*/10 * * * *', () => task(ctx), {
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

bot.command('stats', (ctx) => {
  let output = ``

  Object.keys(ctx.session.log).forEach((dateKey) => {
    output += `*${dateKey}*\n`

    const times = []
    ctx.session.log[dateKey].map((arr) => {
      times.push(`${arr.time} - *${arr.count}*`)
    })

    output += times.join(', ')
  })

  ctx.replyWithMarkdown(output)
})

bot.command('/remove', (ctx) => {
  ctx.replyWithMarkdown(
    `Removing session from database: \`${JSON.stringify(ctx.session)}\``
  )
  ctx.session = null
})

app.use(bot.webhookCallback('/secret-path'))

app.use(express.static('public'))

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
