import {expect, test, describe, it, beforeAll} from '@jest/globals'
import {GhPrHandler} from '../src/octokit-helpers'
import {GhTestDataLoaderForPr6ForIssue5} from './testdata-loader';

describe('octokit-service tests', () => {
  let service: GhPrHandler

  beforeAll(() => {
    const pr6ForIssue5 = GhTestDataLoaderForPr6ForIssue5.build()
    service = new GhPrHandler(pr6ForIssue5)
  })
  it('Pull Request 6の各種プロパティが取得できる', () => {
    expect(service.title).toBe('Feature/#5 small update')
    expect(service.relatedIssueNumber).toBe(5)
    expect(service.relatedIssueUrl).toBe('https://api.github.com/repos/hoge-user/sample-ai-reviewed/issues/5')
  })
})
