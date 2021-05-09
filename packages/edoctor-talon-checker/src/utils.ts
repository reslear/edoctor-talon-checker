import FormData from 'form-data'
import { TObject } from './types'

export const objectToFormData = (obj: TObject) => {
  let form = new FormData()

  for (let [key, value] of Object.entries(obj)) {
    form.append(key, value)
  }

  return form
}
