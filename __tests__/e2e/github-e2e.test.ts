import {describe, it, expect} from '@jest/globals'
import dotenv from 'dotenv'
import {octokit} from '../../src/octokit'
import {OctokitWrapper} from '../../src/octokit-wrapper'
import {GhPrHandler, GhIssueHandler} from '../../src/octokit-helpers'

/**
 * GitHub APIを使ったE2Eテスト。オプション付で、`RUN_GITHUB_E2E_TESTS=1 npm run test`としたときのみ実行可能。アクセス制限(1時間あたり60回)に係るので。
 * GitHub上のf-kana/sample-ai-reviewedリポジトリに依存したテストになっている。
 * - #5: Issue
 * - #6: PR, related to #5
 */
describe('E2E Tests with GitHub', () => {
  dotenv.config({override: false})
  if (!process.env.RUN_GITHUB_E2E_TESTS) {
    it.skip('Skip GitHub E2E test.', () => {})
  } else {
    it('PR #6 is related to Issue #5; try extracting #5 info from #6.', async () => {
      const octokitWrapper = new OctokitWrapper(octokit, 'f-kana', 'sample-ai-reviewed')
      const pr = await octokitWrapper.getPr({pull_number: 6})
      const prHandler = new GhPrHandler(pr)
      const relatedIssueNumber = prHandler.relatedIssueNumber || 0
      expect(relatedIssueNumber).toBe(5)

      const relatedIssue = await octokitWrapper.getIssue({issue_number: relatedIssueNumber})
      expect(relatedIssue).not.toBeNull()
      const issueHandler = new GhIssueHandler(relatedIssue)
      expect(issueHandler.titleAndBody).toContain('Issue Title: 出力文字数が少なすぎて表示が見づらい')
      expect(issueHandler.titleAndBody).toContain('問題点')
    })
  }
})
