import got from 'got'
import FormData from 'form-data'
import iconv from 'iconv-lite'
import { NotificationCenter } from 'node-notifier'
import path from 'path'

var notifier = new NotificationCenter({
  withFallback: false,
})

export type TObj = { [K: string]: string }
export interface IOptions {
  form_data: TObj
  url: string
}

export const getFormData = (obj: TObj) => {
  let form = new FormData()

  for (let [key, value] of Object.entries(obj)) {
    form.append(key, value)
  }

  return form
}

export const startTalonCheck = async ({ form_data, url }: IOptions) => {
  const form = getFormData(form_data)

  const { body, headers } = await got.post<string>(url, {
    body: form,
    encoding: 'binary',
  })

  let data = iconv.decode(Buffer.from(body, 'binary'), 'win1251')

  const regex = /type="checkbox"/g
  const regex_unavailable = /отсутствуют/

  let result = {
    count: 0,
  }

  if (regex.test(data) && !regex_unavailable.test(data)) {
    const count = data.match(regex)?.length || 0

    if (count > 0) {
      notifier.notify({
        title: 'Появились талоны к врачу',
        message: `количество - ${count}`,
        sound: '',
        wait: false,
        open: url,
      })
    }

    result.count = count
  }

  return result
}
