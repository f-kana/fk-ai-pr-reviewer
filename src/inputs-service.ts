import {Inputs} from './inputs'
import {context as github_context} from '@actions/github'
import {Context} from '@actions/github/lib/context'
import {octokit} from './octokit'


export class InputsService {
  private readonly _inputs: Inputs
  private readonly _context: Context
  private readonly _repo: string
  private readonly _owner: string

  constructor(inputs: Inputs) {
    this._inputs = inputs
    this._context = github_context
    this._repo = this._context.repo.repo
    this._owner = this._context.repo.owner
  }

  /// 現在は単なるWrapperだが、将来的にはこのメソッドに実装を移す。
  render(content: string): string {
    return this._inputs.render(content)
  }

  async fetchAndStoreIssueDetails(issueNumber: number): Promise<void> {
    // const response = await axios.get(`https://api.github.com/repos/{owner}/{repo}/issues/${issueId}`)
    // this.issueDetails = response.data
    octokit.issues.get({owner: this._owner, repo: this._repo, issue_number: issueNumber});
  }
}
