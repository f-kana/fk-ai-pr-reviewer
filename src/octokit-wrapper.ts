import {OctokitResponse} from '@octokit/types'
import {Octokit} from '@octokit/action'

export class OctokitWrapper {
  constructor(private readonly _octokit: Octokit, private readonly _owner: string = '', private readonly _repo: string = '') {
  }

  public async getIssue(params: {owner?: string; repo?: string; issue_number: number}) {
    const newParams = {
      ...params,
      owner: params.owner || this._owner,
      repo: params.repo || this._repo
    }
    return await this._octokit.issues.get(newParams)
  }
  public async getPr(params: {owner?: string; repo?: string; pull_number: number}) {
    const newParams = {
      ...params,
      owner: params.owner || this._owner,
      repo: params.repo || this._repo
    }
    return await this._octokit.pulls.get(newParams)
  }
}
