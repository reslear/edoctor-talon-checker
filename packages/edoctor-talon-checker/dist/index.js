"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }// src/lib/index.ts
var _got = require('got'); var _got2 = _interopRequireDefault(_got);
var _iconvlite = require('iconv-lite'); var _iconvlite2 = _interopRequireDefault(_iconvlite);

// src/utils.ts
var _formdata = require('form-data'); var _formdata2 = _interopRequireDefault(_formdata);
var objectToFormData = (obj) => {
  let form = new (0, _formdata2.default)();
  for (let [key, value] of Object.entries(obj)) {
    form.append(key, value);
  }
  return form;
};

// src/lib/index.ts
var checkTalon = async ({form_data, url}) => {
  var _a;
  const form = objectToFormData(form_data);
  const {body} = await _got2.default.post(url, {
    body: form,
    encoding: "binary"
  });
  let data = _iconvlite2.default.decode(Buffer.from(body, "binary"), "win1251");
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


exports.checkTalon = checkTalon;
