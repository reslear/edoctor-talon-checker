import got from 'got'
import iconv from 'iconv-lite'
import { IOptions } from '../types'
import { objectToFormData } from '../utils'

export const checkTalon = async ({ form_data, url }: IOptions) => {
  const form = objectToFormData(form_data)

  const { body } = await got.post<string>(url, {
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
    result.count = count
  }

  return result
}
