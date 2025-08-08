export class TokenLimits {
  /**
   * トークン数の制限値は、入力と出力の合計。
   * GPT-4: 8,192
   * GPT-4o: 128,000
   * GPT-5: 200,000 (estimated)
   * Refs: https://platform.openai.com/docs/models/gpt-4-turbo-and-gpt-4
   */
  maxTokens: number
  requestTokens: number
  responseTokens: number
  knowledgeCutOff: string

  constructor(model = 'gpt-3.5-turbo') {
    // Update knowledge cutoff for newer models
    if (model === 'gpt-5') {
      this.knowledgeCutOff = '2025-08-01'
    } else if (model === 'gpt-4o') {
      this.knowledgeCutOff = '2024-04-01'
    } else {
      this.knowledgeCutOff = '2021-09-01'
    }

    if (model === 'gpt-5') {
      this.maxTokens = 200000
      this.responseTokens = 8000
    } else if (model === 'gpt-4-32k') {
      this.maxTokens = 32600
      this.responseTokens = 4000
    } else if (model === 'gpt-3.5-turbo-16k') {
      this.maxTokens = 16300
      this.responseTokens = 3000
    } else if (model === 'gpt-4') {
      this.maxTokens = 8000
      this.responseTokens = 2000
    } else if (model === 'gpt-4o') {
      this.maxTokens = 128000
      this.responseTokens = 4000
    } else {
      this.maxTokens = 4000
      this.responseTokens = 1000
    }
    // provide some margin for the request tokens
    this.requestTokens = this.maxTokens - this.responseTokens - 100
  }

  string(): string {
    return `max_tokens=${this.maxTokens}, request_tokens=${this.requestTokens}, response_tokens=${this.responseTokens}`
  }
}
