import {setFailed} from '@actions/core'

/**
 * OpenAI API クライアント（GPT-5対応）
 *
 * GPT-5では max_tokens の代わりに max_completion_tokens を使用する必要がある。
 * 古いchatgptライブラリは対応していないため、直接OpenAI APIを呼び出す。
 */

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface OpenAIApiOptions {
  apiKey: string
  apiOrg?: string
  apiBaseUrl: string
  model: string
  temperature: number
  maxTokens: number
  debug: boolean
}

export interface OpenAIResponse {
  id: string
  text: string
  model: string
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export class OpenAIClient {
  private readonly options: OpenAIApiOptions

  constructor(options: OpenAIApiOptions) {
    this.options = options
  }

  async sendMessage(content: string, systemMessage?: string): Promise<OpenAIResponse> {
    const messages: OpenAIMessage[] = []

    if (systemMessage) {
      messages.push({role: 'system', content: systemMessage})
    }

    messages.push({role: 'user', content})

    const requestBody = this.buildRequestBody(messages)

    if (this.options.debug) {
      console.log('OpenAI API request:', JSON.stringify(requestBody, null, 2))
    }

    // fetch 利用: Node.js 18+ で存在。存在しない (古い Node/Jest 環境) 場合は https で簡易 polyfill
    let fetchFn: typeof fetch
    if (globalThis.fetch) {
      fetchFn = globalThis.fetch
    } else {
      // 簡易 polyfill (POST + JSON ボディのみ対応 / 最低限)
      // ※ 本番ランタイムでは Node18+ 前提。テスト環境用フォールバック。
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const https = require('https')
      fetchFn = (async (url: string, init?: any): Promise<any> => {
        return new Promise((resolve, reject) => {
          const u = new URL(url)
          const req = https.request(
            {
              hostname: u.hostname,
              path: u.pathname + u.search,
              method: init?.method || 'GET',
              headers: init?.headers
            },
            (res: any) => {
              const chunks: any[] = []
              res.on('data', (c: any) => chunks.push(c))
              res.on('end', () => {
                const buffer = Buffer.concat(chunks)
                const text = buffer.toString('utf-8')
                resolve({
                  ok: res.statusCode >= 200 && res.statusCode < 300,
                  status: res.statusCode,
                  text: async () => text,
                  json: async () => {
                    try {
                      return JSON.parse(text)
                    } catch {
                      return {}
                    }
                  }
                })
              })
            }
          )
          req.on('error', reject)
            if (init?.body) {
              req.write(init.body)
            }
            req.end()
        })
      }) as any
    }

    try {
      const response = await fetchFn(`${this.options.apiBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify(requestBody)
      } as any)

      if (!response.ok) {
        const errorText = await response.text()
        const errorMessage = `OpenAI API error ${response.status}: ${errorText}`

        // エラーの場合はCI を失敗させる
        setFailed(errorMessage)
        throw new Error(errorMessage)
      }

      const data = await response.json()

      if (this.options.debug) {
        console.log('OpenAI API response:', JSON.stringify(data, null, 2))
      }

      return this.parseResponse(data)
    } catch (error) {
      const errorMessage = `Failed to call OpenAI API: ${error}`

      // エラーの場合はCI を失敗させる
      setFailed(errorMessage)
      throw error
    }
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.options.apiKey}`
    }

    if (this.options.apiOrg) {
      headers['OpenAI-Organization'] = this.options.apiOrg
    }

    return headers
  }

  private buildRequestBody(messages: OpenAIMessage[]): Record<string, any> {
    const isGpt5 = this.options.model.startsWith('gpt-5')

    const body: Record<string, any> = {
      model: this.options.model,
      messages
    }

    // 仕様変更: GPT-5 では temperature パラメータをサポートせず、他モデルでも任意 (デフォルト=1) のため常に送信しない。
    // 互換性簡素化のため gpt-4o 等向けの temperature チューニング機能は削除 (要求により切り捨て)。

    // GPT-5では max_completion_tokens、それ以外では max_tokens を使用
    if (isGpt5) {
      body.max_completion_tokens = this.options.maxTokens
    } else {
      body.max_tokens = this.options.maxTokens
    }

    return body
  }

  private parseResponse(data: any): OpenAIResponse {
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No choices returned from OpenAI API')
    }

    const choice = data.choices[0]
    if (!choice.message || !choice.message.content) {
      throw new Error('No message content returned from OpenAI API')
    }

    return {
      id: data.id || 'unknown',
      text: choice.message.content,
      model: data.model,
      usage: data.usage || {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      }
    }
  }
}
