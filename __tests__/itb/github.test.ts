import {describe, it, expect} from '@jest/globals'
import dotenv from 'dotenv'
import {octokit} from '../../src/octokit'

/// GitHub APIとの接続テスト。オプション付で、`RUN_GITHUB_API_TESTS=1 npm test`としたときのみ実行可能。アクセス制限(1時間あたり60回)に係るので。
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
      console.log(JSON.stringify(issue, null, 2))
    })
  }
})
