/// GitHub APIの設定を行ったoctokitオブジェクトをexportしている。

import {getInput, warning} from '@actions/core'
import {Octokit} from '@octokit/action'
import {retry} from '@octokit/plugin-retry'
import {throttling} from '@octokit/plugin-throttling'

import dotenv from 'dotenv'

// ローカル開発要。process.env.GITHUB_TOKEN will be loaded from .env
if (!process.env.GITHUB_TOKEN) {
  dotenv.config({override: false})
}

// ダミー値でも良いのでGITHUB_ACTIONに何かセットしないと下記シングルトン生成が失敗するのでダミーセット
if (process.env.JEST_TEST) {
  process.env.GITHUB_ACTION = '1'
}

const token = getInput('token') || process.env.GITHUB_TOKEN

const RetryAndThrottlingOctokit = Octokit.plugin(throttling, retry)

/// シングルトンの生成。環境変数 GITHUB_TOKEN (, GITHUB_ACTION)が必要
export const octokit = new RetryAndThrottlingOctokit({
  auth: `token ${token}`,
  throttle: {
    onRateLimit: (retryAfter: number, options: any, _o: any, retryCount: number) => {
      warning(
        `Request quota exhausted for request ${options.method} ${options.url}
Retry after: ${retryAfter} seconds
Retry count: ${retryCount}
`
      )
      if (retryCount <= 3) {
        warning(`Retrying after ${retryAfter} seconds!`)
        return true
      }
    },
    onSecondaryRateLimit: (retryAfter: number, options: any) => {
      warning(
        `SecondaryRateLimit detected for request ${options.method} ${options.url} ; retry after ${retryAfter} seconds`
      )
      // if we are doing a POST method on /repos/{owner}/{repo}/pulls/{pull_number}/reviews then we shouldn't retry
      if (options.method === 'POST' && options.url.match(/\/repos\/.*\/.*\/pulls\/.*\/reviews/)) {
        return false
      }
      return true
    }
  }
})
