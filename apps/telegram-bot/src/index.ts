import express, { Request, RequestHandler, Response } from 'express'
import { Telegraf, Markup, Context } from 'telegraf'

import LocalSession from 'telegraf-session-local'

import { checkTalon } from 'edoctor-talon-checker'
import { CronosTask, scheduleTask } from 'cronosjs'
import dayjs from 'dayjs'

import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Europe/Minsk')

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

const localSession = new LocalSession({
  database: 'public/sessions.json',
})

bot.use(localSession.middleware())


const app = express()

const url = 'http://178.124.171.86:8081/4DACTION/TalonyWeb_TalonyList'
let schedule: CronosTask | null = null

let minutes = 5 

const task = async (ctx: MyContext, { show_no_talon = false } = {}) => {

  ctx.session.log = ctx.session.log || {}

  const { count } = await checkTalon({
    url,
    form_data: { Check25: 'on' },
  })

  const dateKey = dayjs().tz().format('DD.MM.YY')
  if (!ctx.session.log[dateKey]) ctx.session.log[dateKey] = []

  ctx.session.log[dateKey].push({
    time: dayjs().tz().format('HH:mm'),
    count,
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
  // https://github.com/telegraf/telegraf/issues/204#issuecomment-340902071
  ctx.replyWithMarkdown(
    `Привет, начнем?`,
    Markup.keyboard([
      Markup.button.text('/run'),
      Markup.button.text('/stop'),
      Markup.button.text('/once'),
      Markup.button.text('/stats'),
      Markup.button.text('/remove'),
    ]).resize()
  )
})

const runMw = async (ctx) => {

  if (schedule) {
    schedule.stop()
    schedule = null
  }

  schedule = scheduleTask(
    `*/${minutes} * * * *`,
    () => {
      task(ctx)
    },
    {
      timezone: 'Europe/Minsk',
    }
  )



  ctx.replyWithMarkdown(`✅ Schedule for checking talons success running every ${minutes} minutes`)
  schedule.start()

  await task(ctx)
}

bot.command('run', runMw)

bot.hears(/set (.+)/, (ctx, next) => {

  const m = parseInt(ctx.match?.[1]) || 5

  if (m < 1 || m > 60) {
    ctx.reply('error set, only 1 – 60')
    return
  }

  minutes = m

  ctx.reply(`success set ${m} minutes`)
  next()
}, runMw)

bot.command('stop', async (ctx) => {
  if (schedule && schedule.isRunning) {
    schedule.stop()
    ctx.replyWithMarkdown(`🛑 checking stop`)
  } else {
    ctx.replyWithMarkdown('checking not running')
  }
})

bot.command('once', async (ctx) => {
  await task(ctx, { show_no_talon: true })
})

const getLastObject = <T>(obj: T) => {

  const lastKey = Object.keys(obj).pop()
  const lastItem = obj[lastKey]

  return {[lastKey]: lastItem}
}

bot.command('stats', (ctx) => {
  let output = []

  const obj = ctx?.session?.log || {}

  if (!Object.keys(obj).length) {
    ctx.replyWithMarkdown('stats is empty')
    return
  }

  const lastObj = getLastObject(obj)


  for (const [key, value] of Object.entries(lastObj)) {
    output.push(`*${key}*`)

    const times = []

    value.forEach((arr) => {
      times.push(`${arr.time} - *${arr.count}*`)
    })

    output.push(times.join(', '))
  }

  ctx.replyWithMarkdown(output.join('\n'))
})

bot.command('/remove', (ctx) => {
  ctx.replyWithMarkdown(
    `Removing session from database: \`${JSON.stringify(ctx.session)}\``
  )
  ctx.session = null
})

app.use(bot.webhookCallback('/secret-path') as RequestHandler)

app.use(express.static('public'))

app.use('/v1', (req, res) => {
  res.send({ ok: 1 })
})

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
