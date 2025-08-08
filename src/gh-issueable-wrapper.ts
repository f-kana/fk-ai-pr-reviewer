import {OctokitResponse} from '@octokit/types'

/**
 * import {context} from '@actions/github' で得られるcontextについて、
 * context.payloadの[pullrequest | issue]オブジェクトの型情報(のうちこのPJで扱うものだけをPickup)。
 * GitHubの概念ではDiscussionsもIssueableに含まれるが、このPJでは扱わないので考慮外。
 * Note: @actions/github.context.payload.[pullrequest|issue]を使う場合のUT (というかローカルでの動作模擬)はできていないので注意。
 * Note: ちょっと苦し紛れの実装になってしまっている、、、、。公式の型情報の提供がイマイチなのが悪い、、、、。
 */
export interface GhIssueable extends Object {
  title: string
  body: string
  number: number
  head: {
    ref: string
    sha: string
    [key: string]: any
  }
  base: {
    ref: string
    sha: string
    [key: string]: any
  }
  // 他の共通フィールドをここに追加...
}

abstract class GhIssueableWrapper {
  protected _issueable: GhIssueable

  /// 引き数はGitHub APIから取得できるJSON相当のオブジェクト
  // （anyではなくPullRequest型にしたいがimportの仕方がわからない）
  constructor(obj: OctokitResponse<any> | GhIssueable) {
    if ('data' in obj) {
      // OctokitResponseの場合
      this._issueable = obj.data as GhIssueable
    } else if (typeof obj === 'object') {
      this._issueable = obj as GhIssueable
    } else {
      throw new Error('Invalid argument type')
    }
    // 最低限のプロパティが存在するか(エラーが起きないか)バリデート
    this.title
    this.body
  }

  get title(): string {
    return this._issueable.title
  }

  get body(): string {
    return this._issueable.body
  }

  get number(): number {
    return this._issueable.number
  }
}

/// PRをパースして情報を引き出す。特に関連Issue番号を取得するのが目的。
/// 実装後に気づいたが、import {context } from '@actions/github'で得られる
/// context.payload.pullrequestオブジェクトと似た構造になっている。
export class GhPrWrapper extends GhIssueableWrapper {
  get headBranchName(): string {
    // HEAD = だいたいfeatureブランチ
    return this._issueable.head.ref
  }

  get baseBranchName(): string {
    // BASE = だいたいmain, developブランチ
    return this._issueable.base.ref
  }

  // 使ってない(気がする)。OctokitでWrapできているのでURLそのものの生成は不要か。
  get linkedIssueUrl(): string | null {
    if (!this.linkedIssueNumber) {
      return null
    }
    const baseUrl = this._issueable.head.repo.issues_url
    return baseUrl.replace('{/number}', `/${this.linkedIssueNumber.toString()}`)
  }

  get linkedIssueNumber(): number | null {
    return this._linkedIssueNumberFromBranchName ?? this._linkedIssueNumberFromTitle ?? this._linkedIssueNumberFromBody
  }

  /// feature/#12-xxxのような文字列を関連Issueと見做して検出し、12を返す。最初にHitしたもののみが対象。
  private get _linkedIssueNumberFromBranchName(): number | null {
    return this._extractIssueableNumber(this.headBranchName)
  }

  /// #12のような文字列を関連Issueと見做して検出し、12を返す。最初にHitしたもののみが対象。
  private get _linkedIssueNumberFromTitle(): number | null {
    return this._extractIssueableNumber(this.title)
  }

  /// #12のような文字列を関連Issueと見做して検出し、12を返す。最初にHitしたもののみが対象。Bodyはnullか空文字の可能性がある。
  private get _linkedIssueNumberFromBody(): number | null {
    return this.body ? this._extractIssueableNumber(this.body) : null
  }

  private _extractIssueableNumber(text: string): number | null {
    const match = text.match(/#(\d+)/)
    return match ? parseInt(match[1]) : null
  }
}

export class GhIssueWrapper extends GhIssueableWrapper {
  get titleAndBody(): string {
    const part1: string = `Issue Title: ${this.title} (#${this.number})`
    const part2: string = this.body ? `\n\nIssue Details:\n${this.body}` : ''
    return part1 + part2
  }
}
