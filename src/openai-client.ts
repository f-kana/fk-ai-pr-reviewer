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
      messages.push({ role: 'system', content: systemMessage })
    }
    
    messages.push({ role: 'user', content })

    const requestBody = this.buildRequestBody(messages)
    
    if (this.options.debug) {
      console.log('OpenAI API request:', JSON.stringify(requestBody, null, 2))
    }

    // Node.js 18+ の標準fetchを使用、polyfillは不要
    const fetchFn = globalThis.fetch || (await import('node-fetch')).default

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
      'Authorization': `Bearer ${this.options.apiKey}`
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
      messages,
      temperature: this.options.temperature
    }

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