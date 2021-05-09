import fastify from 'fastify'
import { Telegraf, Markup, Context } from 'telegraf'
import {checkTalon} from "edoctor-talon-checker"

import { CronosTask, scheduleTask } from 'cronosjs'
const PORT = process.env.PORT || 3000

if (!process.env.BOT_TOKEN) throw new Error('"BOT_TOKEN" env var is required!')


const bot = new Telegraf(process.env.BOT_TOKEN)
const app = fastify()

const url = 'http://178.124.171.86:8081/4DACTION/TalonyWeb_TalonyList'
let schedule: CronosTask | null = null


const task = async (ctx: Context) => {
  const { count } = await checkTalon({
    url,
    form_data: {Check37: 'on',},
  })

  if (count > 0) {

    const keyboard = Markup.inlineKeyboard([
      Markup.button.url('Открыть Сайт', url),
    ])

    ctx.replyWithMarkdown(`Появились талоны к врачу\nколичество \`${count}\`
    `, keyboard)

  }
}

bot.start(async (ctx) => {
  ctx.replyWithMarkdown(
    `Привет, начнем?`,
    Markup.keyboard([
      Markup.button.text('/run'),
      Markup.button.text('/stop'),
    ]).resize()
  )
})

bot.command('run', async (ctx) => {


  if(!schedule) {

    schedule = scheduleTask('*/30 * * * * * *', () => task(ctx), {
      timezone: 'Europe/Minsk',
    })

    schedule.start();

    ctx.replyWithMarkdown(`✅ Schedule for checking talons success running`)
  }

  
  task(ctx)

})

bot.command('stop', async (ctx) => {


  if(schedule && schedule.isRunning) {
    schedule.stop()
  ctx.replyWithMarkdown(`🛑 checking stop` )
  } else {
    ctx.replyWithMarkdown('checking not running')
  }

});

// if (!WEBHOOK_URL) throw new Error('"WEBHOOK_URL" env var is required!')
// import telegrafPlugin from 'fastify-telegraf';
// refactor next release to `bot.secretPathComponent`
// app.register(telegrafPlugin, { bot, path: '/secret-path' })
// bot.telegram.setWebhook(WEBHOOK_URL).then(() => {
//   console.log('Webhook is set on', WEBHOOK_URL)
// })

bot.launch()


app.listen(PORT).then(() => {
  console.log('Listening on port', PORT)
  
})


const exitArr = ["exit", "SIGINT", 'uncaughtException', 'SIGTERM'];
exitArr.forEach((t) => 
  process.on(t, () => {
    bot.stop()
    process.exit(1)
  })
)
