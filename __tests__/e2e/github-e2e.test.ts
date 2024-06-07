import {describe, it, expect} from '@jest/globals'
import dotenv from 'dotenv'
import {octokit} from '../../src/octokit'
import {OctokitWrapper} from '../../src/octokit-wrapper'
import {GhPrWrapper, GhIssueWrapper} from '../../src/gh-issueable-wrapper'

/**
 * GitHub APIを使ったE2Eテスト。オプション付で、`RUN_GITHUB_E2E_TESTS=1 npm run test`としたときのみ実行可能。アクセス制限(1時間あたり60回)に係るので。
 * GitHub上のf-kana/sample-ai-reviewedリポジトリに依存したテストになっている。
 * - #5: Issue
 * - #6: PR, linked to #5
 */
describe('E2E Tests with GitHub', () => {
  dotenv.config({override: false})
  if (!process.env.RUN_GITHUB_E2E_TESTS) {
    it.skip('Skip GitHub E2E test.', () => {})
  } else {
    it('PR #6 is linked to Issue #5; try extracting #5 info from #6.', async () => {
      const octokitWrapper = new OctokitWrapper(octokit, 'f-kana', 'sample-ai-reviewed')
      const pr = await octokitWrapper.getPr({pull_number: 6})
      const prWrapper = new GhPrWrapper(pr)
      const linkedIssueNumber = prWrapper.linkedIssueNumber || 0
      expect(linkedIssueNumber).toBe(5)

      const linkedIssue = await octokitWrapper.getIssue({issue_number: linkedIssueNumber})
      expect(linkedIssue).not.toBeNull()
      const issueWrapper = new GhIssueWrapper(linkedIssue)
      expect(issueWrapper.titleAndBody).toContain('Issue Title: 出力文字数が少なすぎて表示が見づらい')
      expect(issueWrapper.titleAndBody).toContain('問題点')
    })
  }
})
