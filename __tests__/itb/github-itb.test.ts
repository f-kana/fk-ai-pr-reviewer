import {describe, it, expect} from '@jest/globals'
import dotenv from 'dotenv'
import {octokit} from '../../src/octokit'
import {OctokitWrapper} from '../../src/octokit-wrapper'

/**
 * GitHub APIとの接続テスト。オプション付で、`RUN_GITHUB_API_TESTS=1 npm test`としたときのみ実行可能。アクセス制限(1時間あたり60回)に係るので。
 * GitHub上のf-kana/sample-ai-reviewedリポジトリに依存したテストになっている。
 * - #1: PR (also Issue)
 * - #5: Issue
 * - #6: PR (also Issue)
 */
describe('External Integration Tests (ITb) with GitHub API', () => {
  dotenv.config({override: false})
  if (!process.env.RUN_GITHUB_API_TESTS) {
    it.skip('Skip GitHub API test.', () => {})
  } else {
    it('Just confirm GitHub API call', async () => {
      const params = {
        owner: 'f-kana',
        repo: 'sample-ai-reviewed',
        issue_number: 1
      }
      const issue = await octokit.issues.get(params)
      expect(issue).not.toBeNull()
      expect(issue.status).toBe(200)
    })
    it('OctokitWrapper.getIssue (#1 is an Issue & a PR', async () => {
      const octokitWrapper = new OctokitWrapper(octokit, 'f-kana', 'sample-ai-reviewed')
      const issue = await octokitWrapper.getIssue({issue_number: 1})
      expect(issue).not.toBeNull()
      expect(issue.status).toBe(200)
    })
    it('OctokitWrapper.getPr Success (#6 is a PR)', async () => {
      const octokitWrapper = new OctokitWrapper(octokit, 'f-kana', 'sample-ai-reviewed')
      const issue = await octokitWrapper.getPr({pull_number: 6})
      expect(issue).not.toBeNull()
      expect(issue.status).toBe(200)
    })
    it('OctokitWrapper.getPr Fail (#5 is not a PR, but an Issue)', async () => {
      const octokitWrapper = new OctokitWrapper(octokit, 'f-kana', 'sample-ai-reviewed')
      await expect(octokitWrapper.getPr({pull_number: 5})).rejects.toThrowError()
    })
  }
})
