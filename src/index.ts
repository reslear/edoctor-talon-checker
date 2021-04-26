import { startTalonCheck } from './service'

import { scheduleTask, validate, CronosExpression } from 'cronosjs'
import chalk from 'chalk'

const url = 'http://178.124.171.86:8081/4DACTION/TalonyWeb_TalonyList'
const form_data = {
  Check25: 'on',
  //Check37: 'on',
}

scheduleTask(
  '*/1 * * * *',
  async (timestamp) => {
    console.log(`[${chalk.magenta(timestamp)}] Task triggered`)

    const { count } = await startTalonCheck({
      url,
      form_data,
    })

    console.log(
      `[${chalk.magenta(timestamp)}]: count ${chalk[count ? 'green' : 'gray'](
        count
      )}`
    )
  },
  { timezone: 'Europe/Minsk' }
)