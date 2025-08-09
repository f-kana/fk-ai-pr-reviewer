import {describe, it, expect} from '@jest/globals'

import {OpenAIClient} from '../src/openai-client'

describe('OpenAIClient', () => {
  it('should correctly set max_completion_tokens for GPT-5 models', () => {
    const client = new OpenAIClient({
      apiKey: 'test-key',
      apiBaseUrl: 'https://api.openai.com/v1',
      model: 'gpt-5',
      // temperature omitted (client ignores it)
      temperature: 0.7,
      maxTokens: 4000,
      debug: false
    })

    // buildRequestBodyはprivateメソッドなので、代わりにsendMessageを部分的にテスト
    const messages = [{role: 'user' as const, content: 'test'}]

    // privateメソッドへのアクセスのためのワークアラウンド
    const buildRequestBody = (client as any).buildRequestBody.bind(client)
    const result = buildRequestBody(messages)

  expect(result.max_completion_tokens).toBe(4000)
    expect(result.max_tokens).toBeUndefined()
    expect(result.model).toBe('gpt-5')
  expect(result.temperature).toBeUndefined()
  })

  it('should correctly set max_tokens for non-GPT-5 models', () => {
    const client = new OpenAIClient({
      apiKey: 'test-key',
      apiBaseUrl: 'https://api.openai.com/v1',
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 4000,
      debug: false
    })

    const messages = [{role: 'user' as const, content: 'test'}]

    const buildRequestBody = (client as any).buildRequestBody.bind(client)
    const result = buildRequestBody(messages)

  expect(result.max_tokens).toBe(4000)
  expect(result.max_completion_tokens).toBeUndefined()
  expect(result.model).toBe('gpt-4o')
  expect(result.temperature).toBeUndefined()
  })

  it('should correctly detect GPT-5 variants', () => {
    const models = ['gpt-5', 'gpt-5-mini', 'gpt-5-nano', 'gpt-5-turbo']

    for (const model of models) {
      const client = new OpenAIClient({
        apiKey: 'test-key',
        apiBaseUrl: 'https://api.openai.com/v1',
        model,
        temperature: 0.7,
        maxTokens: 4000,
        debug: false
      })

      const messages = [{role: 'user' as const, content: 'test'}]
      const buildRequestBody = (client as any).buildRequestBody.bind(client)
      const result = buildRequestBody(messages)

      expect(result.max_completion_tokens).toBe(4000)
      expect(result.max_tokens).toBeUndefined()
      expect(result.model).toBe(model)
      expect(result.temperature).toBeUndefined()
    }
  })
})
