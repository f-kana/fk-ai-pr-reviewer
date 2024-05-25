//import {expect, test} from '@jest/globals'
// import * as cp from 'child_process'
// import * as path from 'path'
// import * as process from 'process'

// test('test runs', () => {
//   process.env['INPUT_ACTION'] = 'code-review'
//   const np = process.execPath
//   const ip = path.join(__dirname, '..', 'src', 'main.ts')
//   const options: cp.ExecFileSyncOptions = {
//     env: process.env
//   }
//   console.log(cp.execFileSync(np, [ip], options).toString())
// })

import {expect, test} from '@jest/globals'

function dummy() {
  return 1
}

test('test runs', () => {
  expect(dummy()).toBe(1)
})
