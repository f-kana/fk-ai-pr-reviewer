import {expect, describe, it, beforeAll} from '@jest/globals'
import {
  Commenter,
  IN_PROGRESS_START_TAG,
  IN_PROGRESS_END_TAG,
  RAW_SUMMARY_START_TAG,
  RAW_SUMMARY_END_TAG
} from '../src/commenter'

describe('Commenter tests', () => {
  const content1 = `hello\n${IN_PROGRESS_START_TAG}\nworld\n${IN_PROGRESS_END_TAG}\nof AI Code Reviewer`
  const content2 = `hello\n${RAW_SUMMARY_START_TAG}\nJapan\n${RAW_SUMMARY_END_TAG}\nand Japanese.`

  beforeAll(() => {})

  it('getContentWithinTags', () => {
    // as anyでprotectedに外部からアクセスできる、らしい。
    const result = (Commenter as any).getContentWithinTags(content1, IN_PROGRESS_START_TAG, IN_PROGRESS_END_TAG)
    expect(result).toBe('\nworld\n')
  })
  it('removeContentWithinTags', () => {
    const result = (Commenter as any).removeContentWithinTags(content1, IN_PROGRESS_START_TAG, IN_PROGRESS_END_TAG)
    expect(result).toBe('hello\n\nof AI Code Reviewer')
  })
  it('getRawSummary', () => {

    const commenter = new Commenter()
    const result = commenter.getRawSummary(content2)
    expect(result).toBe('\nJapan\n')
  })
})
