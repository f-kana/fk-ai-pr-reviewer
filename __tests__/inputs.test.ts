import {expect, describe, it, beforeAll} from '@jest/globals'
import {Inputs} from '../src/inputs'

describe('inputs tests', () => {
  it('Inputsのいくつかのプロパティが取得できる', () => {
    const inputs = new Inputs()
    expect(inputs.systemMessage).toBe('')
    expect(inputs.title).toBe('(no title provided)')
    expect(inputs.linkedIssueTitleAndBody).toBe('(no issue is linked with this PR)')
  })
  it('renderメソッドでプレースホルダが置換される', () => {
    const inputs = new Inputs()
    inputs.rawSummary = 'hello' // will be replaced
    inputs.shortSummary = '' // placeholder will remain
    // linkededIssueTitleAndBody: default value will appear
    const content = '1: $raw_summary, 2: $short_summary, 3: $linkedIssueTitleAndBody'
    const expected = '1: hello, 2: $short_summary, 3: (no issue is linked with this PR)'
    expect(inputs.render(content)).toBe(expected)
  })
})
