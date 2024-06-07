import {expect, describe, it, beforeAll} from '@jest/globals'
import {GhPrWrapper, GhIssueWrapper} from '../src/gh-issueable-wrapper'
import {GhTestDataLoaderForPr6ForIssue5, GhTestDataLoaderForIssue5} from './testdata-loader';

describe('octokit-helpers tests', () => {
  beforeAll(() => {})

  it('Pull Request #6の各種プロパティが取得できる', () => {
    const pr6 = GhTestDataLoaderForPr6ForIssue5.build()
    const prWrapper = new GhPrWrapper(pr6)
    expect(prWrapper.title).toBe('Feature/#5 small update')
    expect(prWrapper.number).toBe(6)
    expect(prWrapper.linkedIssueNumber).toBe(5)
    expect(prWrapper.linkedIssueUrl).toBe('https://api.github.com/repos/hoge-user/sample-ai-reviewed/issues/5')
  })
  it('Issue #5の各種プロパティが取得できる', () => {
    const issue5 = GhTestDataLoaderForIssue5.build()
    const issueHandler = new GhIssueWrapper(issue5)
    expect(issueHandler.title).toBe('出力文字数が少なすぎて表示が見づらい')
    expect(issueHandler.body).toContain('問題点')
    expect(issueHandler.number).toBe(5)
    expect(issueHandler.titleAndBody).toContain('Issue Title: 出力文字数が少なすぎて表示が見づらい (#5)')
    expect(issueHandler.titleAndBody).toContain('問題点')
  })
})
