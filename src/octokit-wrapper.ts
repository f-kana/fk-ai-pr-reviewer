import {OctokitResponse} from '@octokit/types'
import {Octokit} from '@octokit/action'

/// 直接Octokitを使のでも全然良いのだが、可読性を上げるために作成。
/// 可読性の向上具合は正直微妙だが、まぁないよりはマシか。
export class OctokitWrapper {
  constructor(
    private readonly _octokit: Octokit,
    private readonly _owner: string = '',
    private readonly _repo: string = ''
  ) {}

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
  public async updatePr(params: {owner?: string; repo?: string; pull_number: number; body?: string}) {
    const newParams = {
      ...params,
      owner: params.owner || this._owner,
      repo: params.repo || this._repo
    }
    return await this._octokit.pulls.update(newParams)
  }
}
