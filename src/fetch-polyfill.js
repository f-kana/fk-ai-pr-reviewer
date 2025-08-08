// fetch-polyfill.js
const fetch = require('node-fetch')

if (!globalThis.fetch) {
  globalThis.fetch = fetch.default || fetch
  globalThis.Headers = fetch.Headers
  globalThis.Request = fetch.Request
  globalThis.Response = fetch.Response
}
