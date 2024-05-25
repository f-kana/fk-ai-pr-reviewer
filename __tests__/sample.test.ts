import {expect, test} from '@jest/globals'

import {sampleFunc} from '../src/sample'

test('test runs', () => {
  expect(sampleFunc(1)).toBe(2)
})
