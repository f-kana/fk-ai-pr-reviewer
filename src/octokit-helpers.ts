import {OctokitResponse} from '@octokit/types';

abstract class GhRestResponseHandler {
  /// 引き数はGitHub APIから取得できるJSON相当のオブジェクト
  // （anyではなくPullRequest型にしたいがimportの仕方がわからない）
  constructor(public readonly restResponse: OctokitResponse<any>) {}

  get title(): string {
    return this.restResponse.data.title
  }

  get body(): string {
    return this.restResponse.data.body
  }
}

/// PRをパースして情報を引き出す。特に関連Issue番号を取得するのが目的。
export class GhPrHandler extends GhRestResponseHandler {
  get headBranchName(): string { // featureブランチ
    return this.restResponse.data.head.ref
  }

  get baseBranchName(): string { // mainブランチ
    return this.restResponse.data.base.ref
  }

  get relatedIssueUrl(): string | null {
    if (!this.relatedIssueNumber) {
      return null
    }
    const baseUrl = this.restResponse.data.head.repo.issues_url
    return baseUrl.replace('{/number}', `/${this.relatedIssueNumber.toString()}`)
  }

  get relatedIssueNumber(): number | null {
    return this.relatedIssueNumberFromBranchName ?? this.relatedIssueNumberFromTitle ?? this.relatedIssueNumberFromBody
  }

  /// feature/#12-xxxのような文字列を関連Issueと見做して検出し、12を返す。最初にHitしたもののみが対象。
  private get relatedIssueNumberFromBranchName(): number | null {
    const match = this.headBranchName.match(/#(\d+)/)
    return match ? parseInt(match[1], 10) : null
  }

  /// #12のような文字列を関連Issueと見做して検出し、12を返す。最初にHitしたもののみが対象。
  private get relatedIssueNumberFromTitle(): number | null {
    const match = this.title.match(/#(\d+)/)
    return match ? parseInt(match[1], 10) : null
  }

  /// #12のような文字列を関連Issueと見做して検出し、12を返す。最初にHitしたもののみが対象。
  private get relatedIssueNumberFromBody(): number | null {
    const match = this.body.match(/#(\d+)/)
    return match ? parseInt(match[1], 10) : null
  }
}

export class GhIssueHandler extends GhRestResponseHandler {
  get titleAndBody(): string {
    const part1: string = `Issue Title: ${this.title}`
    const part2: string = this.body ? `\n\nIssue Details: ${this.body}` : ''
    return part1 + part2
  }
}
