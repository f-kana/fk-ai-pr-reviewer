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
  linkedIssueTitleAndBody: string

  constructor(
    systemMessage = '',
    title = '(no title provided)',
    description = '(no description provided)',
    rawSummary = '',
    shortSummary = '',
    filename = '',
    fileContent = '(file contents cannot be provided)',
    fileDiff = '(file diff cannot be provided)',
    patches = '',
    diff = '(no diff)',
    commentChain = '(no other comments on this patch)',
    comment = '(no comment provided)',
    linkedIssueTitleAndBody = '(no issue is linked with this PR)'
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
    this.linkedIssueTitleAndBody = linkedIssueTitleAndBody
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
      this.linkedIssueTitleAndBody
    )
  }

  /// content: 「$system_message」 などのプレースホルダを含んだ文字列
  ///    Promptsクラスのプロパティが来ることが多い。
  render(content: string): string {
    const replacements: [string, string][] = [
      ['$system_message', this.systemMessage],
      ['$title', this.title],
      ['$description', this.description],
      ['$raw_summary', this.rawSummary],
      ['$short_summary', this.shortSummary],
      ['$filename', this.filename],
      ['$file_content', this.fileContent],
      ['$file_diff', this.fileDiff],
      ['$patches', this.patches],
      ['$diff', this.diff],
      ['$comment_chain', this.commentChain],
      ['$comment', this.comment],
      ['$linkedIssueTitleAndBody', this.linkedIssueTitleAndBody]
    ]

    for (const [searchValue, replaceValue] of replacements) {
      if (replaceValue) {
        content = content.replace(searchValue, replaceValue)
      }
    }
    return content
  }
}
