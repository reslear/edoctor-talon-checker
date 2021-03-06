import { checkTalon } from '../../../packages/edoctor-talon-checker/src/lib'

import { scheduleTask } from 'cronosjs'
import chalk from 'chalk'

import { NotificationCenter } from 'node-notifier'

var notifier = new NotificationCenter({
  withFallback: false,
})

const url = 'http://178.124.171.86:8081/4DACTION/TalonyWeb_TalonyList'
const form_data = {
  //Check25: 'on',
  Check37: 'on',
}

const task = async (timestamp: number) => {
  console.log(`[${chalk.magenta(timestamp)}] Проверка талонов...`)

  const { count } = await checkTalon({
    url,
    form_data,
  })

  if (count > 0) {
    notifier.notify({
      title: 'Появились талоны к врачу',
      message: `количество - ${count}`,
      sound: '',
      wait: false,
      open: url,
    })
  }

  console.log(
    `[${chalk.magenta(timestamp)}]: Найдено количество ${chalk[
      count ? 'green' : 'gray'
    ](count)}`
  )
}

// start cron
scheduleTask('*/5 * * * *', task, {
  timezone: 'Europe/Minsk',
})

// start immediate
task(+new Date())
