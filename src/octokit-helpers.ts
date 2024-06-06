import {OctokitResponse} from '@octokit/types';

/// PRをパースして情報を引き出す。特に関連Issue番号を取得するのが目的。
export class GhPrHandler {
  /// 引き数はGitHub APIから取得できるJSON相当のオブジェクト
  // （anyではなくPullRequest型にしたいがimportの仕方がわからない）
  constructor(public readonly pullRequestObj: OctokitResponse<any>) {}

  get title(): string {
    return this.pullRequestObj.data.title
  }

  get body(): string {
    return this.pullRequestObj.data.body
  }

  get headBranchName(): string { // featureブランチ
    return this.pullRequestObj.data.head.ref
  }

  get baseBranchName(): string { // mainブランチ
    return this.pullRequestObj.data.base.ref
  }

  get relatedIssueUrl(): string | null {
    if (!this.relatedIssueNumber) {
      return null
    }
    const baseUrl = this.pullRequestObj.data.head.repo.issues_url
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

