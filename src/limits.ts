export class TokenLimits {
  /**
   * トークン数の制限値は、入力と出力の合計。
   * GPT-5 / GPT-5.4-mini / GPT-5.4-nano: 400,000
   * GPT-5.4 / GPT-5.5: 1,050,000
   * Refs: https://platform.openai.com/docs/models/gpt-5
   */
  maxTokens: number
  requestTokens: number
  responseTokens: number
  knowledgeCutOff: string

  constructor(model = 'gpt-5.4-mini') {
    if (model === 'gpt-5.5') {
      this.knowledgeCutOff = '2025-12-01'
    } else if (
      model === 'gpt-5.4' ||
      model === 'gpt-5.4-mini' ||
      model === 'gpt-5.4-nano'
    ) {
      this.knowledgeCutOff = '2025-08-31'
    } else {
      this.knowledgeCutOff = '2024-08-01'
    }

    if (model === 'gpt-5.5' || model === 'gpt-5.4') {
      this.maxTokens = 1050000
      this.responseTokens = 128000
    } else {
      this.maxTokens = 400000
      this.responseTokens = 128000
    }
    // provide some margin for the request tokens
    this.requestTokens = this.maxTokens - this.responseTokens - 100
  }

  string(): string {
    return `max_tokens=${this.maxTokens}, request_tokens=${this.requestTokens}, response_tokens=${this.responseTokens}`
  }
}
