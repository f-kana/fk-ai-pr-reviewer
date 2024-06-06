import {expect, test, describe, it, beforeAll} from '@jest/globals'
import {GhPrHandler, GhIssueHandler} from '../src/octokit-helpers'
import {GhTestDataLoaderForPr6ForIssue5, GhTestDataLoaderForIssue5} from './testdata-loader';

describe('octokit-service tests', () => {

  beforeAll(() => {})

  it('Pull Request #6の各種プロパティが取得できる', () => {
    const pr6 = GhTestDataLoaderForPr6ForIssue5.build()
    const prHandler = new GhPrHandler(pr6)
    expect(prHandler.title).toBe('Feature/#5 small update')
    expect(prHandler.relatedIssueNumber).toBe(5)
    expect(prHandler.relatedIssueUrl).toBe('https://api.github.com/repos/hoge-user/sample-ai-reviewed/issues/5')
  })
  it('Issue #5の各種プロパティが取得できる', () => {
    const issue5 = GhTestDataLoaderForIssue5.build()
    const issueHandler = new GhIssueHandler(issue5)
    expect(issueHandler.title).toBe('出力文字数が少なすぎて表示が見づらい')
    expect(issueHandler.body).toContain('問題点')
    expect(issueHandler.titleAndBody).toContain('Issue Title: 出力文字数が少なすぎて表示が見づらい')
    expect(issueHandler.titleAndBody).toContain('問題点')
  })
})
