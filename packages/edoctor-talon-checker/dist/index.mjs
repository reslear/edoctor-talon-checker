// src/lib/index.ts
import got from "got";
import iconv from "iconv-lite";

// src/utils.ts
import FormData from "form-data";
var objectToFormData = (obj) => {
  let form = new FormData();
  for (let [key, value] of Object.entries(obj)) {
    form.append(key, value);
  }
  return form;
};

// src/lib/index.ts
var checkTalon = async ({form_data, url}) => {
  var _a;
  const form = objectToFormData(form_data);
  const {body} = await got.post(url, {
    body: form,
    encoding: "binary"
  });
  let data = iconv.decode(Buffer.from(body, "binary"), "win1251");
  const regex = /type="checkbox"/g;
  const regex_unavailable = /отсутствуют/;
  let result = {
    count: 0
  };
  if (regex.test(data) && !regex_unavailable.test(data)) {
    const count = ((_a = data.match(regex)) == null ? void 0 : _a.length) || 0;
    result.count = count;
  }
  return result;
};
export {
  checkTalon
};
