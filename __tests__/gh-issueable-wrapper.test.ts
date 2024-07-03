import {expect, describe, it, beforeAll} from '@jest/globals'
import {GhPrWrapper, GhIssueWrapper} from '../src/gh-issueable-wrapper'
import {GhTestDataLoaderForPr6ForIssue5, GhTestDataLoaderForIssue5} from './testdata-loader';

describe('octokit-helpers tests', () => {
  beforeAll(() => {})

  it('Pull Request #6の各種プロパティが取得できる。(Related Issueを含む)', () => {
    const pr6 = GhTestDataLoaderForPr6ForIssue5.build()
    const prWrapper = new GhPrWrapper(pr6)
    expect(prWrapper.title).toBe('Feature/#5 small update')
    expect(prWrapper.number).toBe(6)
    expect(prWrapper.linkedIssueNumber).toBe(5)
    expect(prWrapper.linkedIssueUrl).toBe('https://api.github.com/repos/hoge-user/sample-ai-reviewed/issues/5')
  })

  it('Pull Request #6の各種プロパティが取得できる。(Related Issueは無効化)', () => {
    const pr6 = GhTestDataLoaderForPr6ForIssue5.build()

    // Related Issueが無い場合をテストしたいので無効化。Bodyが空でもエラーが起きないことを確認する。
    pr6.data.title = 'small update'
    pr6.data.body = null
    pr6.data.head.ref = 'bugfix/dummy'

    const prWrapper = new GhPrWrapper(pr6)
    expect(prWrapper.title).toBe('small update')
    expect(prWrapper.linkedIssueNumber).toBeNull()
  })

  it('Issue #5の各種プロパティが取得できる', () => {
    const issue5FromTestData = GhTestDataLoaderForIssue5.build()
    const issueHandler = new GhIssueWrapper(issue5FromTestData)
    expect(issueHandler.title).toBe('出力文字数が少なすぎて表示が見づらい')
    expect(issueHandler.body).toContain('問題点')
    expect(issueHandler.number).toBe(5)
    expect(issueHandler.titleAndBody).toContain('Issue Title: 出力文字数が少なすぎて表示が見づらい (#5)')
    expect(issueHandler.titleAndBody).toContain('問題点')
  })
})
