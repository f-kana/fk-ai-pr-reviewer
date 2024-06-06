/// １つのPRに関する情報をまとめた構造体
export class Inputs {
  systemMessage: string
  title: string
  description: string
  rawSummary: string
  shortSummary: string
  filename: string
  fileContent: string
  fileDiff: string
  patches: string
  diff: string
  commentChain: string
  comment: string
  ghIssue?: GhIssue

  constructor(
    systemMessage = '',
    title = 'no title provided',
    description = 'no description provided',
    rawSummary = '',
    shortSummary = '',
    filename = '',
    fileContent = 'file contents cannot be provided',
    fileDiff = 'file diff cannot be provided',
    patches = '',
    diff = 'no diff',
    commentChain = 'no other comments on this patch',
    comment = 'no comment provided',
    ghIssue?: GhIssue,
  ) {
    this.systemMessage = systemMessage
    this.title = title
    this.description = description
    this.rawSummary = rawSummary
    this.shortSummary = shortSummary
    this.filename = filename
    this.fileContent = fileContent
    this.fileDiff = fileDiff
    this.patches = patches
    this.diff = diff
    this.commentChain = commentChain
    this.comment = comment
    this.ghIssue = ghIssue
  }

  clone(): Inputs {
    return new Inputs(
      this.systemMessage,
      this.title,
      this.description,
      this.rawSummary,
      this.shortSummary,
      this.filename,
      this.fileContent,
      this.fileDiff,
      this.patches,
      this.diff,
      this.commentChain,
      this.comment,
      this.ghIssue?.clone() ?? undefined,
    )
  }

  _subtractGhIssueNumber(title: string, description: string): number {
    return 0 // dummy return
  }

  /// content: 「$system_message」 などのプレースホルダを含んだ文字列
  ///    Promptsクラスのプロパティが来ることが多い。
  render(content: string): string {
    if (!content) {
      return ''
    }
    if (this.systemMessage) {
      content = content.replace('$system_message', this.systemMessage)
    }
    if (this.title) {
      content = content.replace('$title', this.title)
    }
    if (this.description) {
      content = content.replace('$description', this.description)
    }
    if (this.rawSummary) {
      content = content.replace('$raw_summary', this.rawSummary)
    }
    if (this.shortSummary) {
      content = content.replace('$short_summary', this.shortSummary)
    }
    if (this.filename) {
      content = content.replace('$filename', this.filename)
    }
    if (this.fileContent) {
      content = content.replace('$file_content', this.fileContent)
    }
    if (this.fileDiff) {
      content = content.replace('$file_diff', this.fileDiff)
    }
    if (this.patches) {
      content = content.replace('$patches', this.patches)
    }
    if (this.diff) {
      content = content.replace('$diff', this.diff)
    }
    if (this.commentChain) {
      content = content.replace('$comment_chain', this.commentChain)
    }
    if (this.comment) {
      content = content.replace('$comment', this.comment)
    }

    content = this.ghIssue?.render(content) ?? content

    return content
  }
}

/// GitHub Issuesの中身
export class GhIssue {
  number: number
  title: string
  description: string

  constructor(
    number = 0,
    title = 'no issue is associated with this PR',
    description = 'no issue is associated with this PR',
  ) {
    this.number = number
    this.title = title
    this.description = description
  }

  clone(): GhIssue {
    return new GhIssue(this.number, this.title, this.description)
  }

  render(content: string): string {
    if (!content) {
      return ''
    }
    if (this.number) {
      content = content.replace('$gh_issue_number', this.number.toString())
    }
    if (this.title) {
      content = content.replace('$gh_issue_title', this.title)
    }
    if (this.description) {
      content = content.replace('$gh_issue_description', this.description)
    }
    return content
  }
}
