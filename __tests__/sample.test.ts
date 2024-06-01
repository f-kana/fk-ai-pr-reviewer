import {expect, test, describe, it} from '@jest/globals'
import dotenv from 'dotenv'
import {info, warning} from '@actions/core'

import {sampleFunc} from '../src/sample'

test('test runs', () => {
  expect(sampleFunc(1)).toBe(2)
})

// describe('dot env test with .env.sample', () => {
//   dotenv.config({path: '.env.sample', override: false})
//   it('GITHUB_TOKEN can be read', () => {
//     expect(process.env.GITHUB_TOKEN).toBe("xxxxxxxxx")
//   })
//   it('OPENAI_API_KEY can be read', () => {
//     expect(process.env.OPENAI_API_KEY).toBe("yyyyyyyyy")
//   })
//   it('DUMMY_KEY does not exist', () => {
//     expect(process.env.DUMMY_KEY).toBeUndefined()
//   })
// })

describe('actions console output tests', () => {
  it('should output warning', () => {
    warning('Test warning message')
  })
  it('should output info', () => {
    info('Test info message')
  })
})
