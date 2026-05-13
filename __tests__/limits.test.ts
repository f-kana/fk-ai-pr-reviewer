import {describe, test, expect} from '@jest/globals'
import {TokenLimits} from '../src/limits'

describe('TokenLimits tests', () => {
  test('GPT-5モデルの設定が正しく適用される', () => {
    const limits = new TokenLimits('gpt-5')

    expect(limits.maxTokens).toBe(400000)
    expect(limits.responseTokens).toBe(128000)
    expect(limits.knowledgeCutOff).toBe('2024-08-01')
    expect(limits.requestTokens).toBe(400000 - 128000 - 100)
  })

  test('GPT-5.5モデルの設定が正しく適用される', () => {
    const limits = new TokenLimits('gpt-5.5')

    expect(limits.maxTokens).toBe(1050000)
    expect(limits.responseTokens).toBe(128000)
    expect(limits.knowledgeCutOff).toBe('2025-12-01')
    expect(limits.requestTokens).toBe(1050000 - 128000 - 100)
  })

  test('GPT-5.4モデルの設定が正しく適用される', () => {
    const limits = new TokenLimits('gpt-5.4')

    expect(limits.maxTokens).toBe(1050000)
    expect(limits.responseTokens).toBe(128000)
    expect(limits.knowledgeCutOff).toBe('2025-08-31')
    expect(limits.requestTokens).toBe(1050000 - 128000 - 100)
  })

  test('GPT-5.4-miniモデルの設定が正しく適用される', () => {
    const limits = new TokenLimits('gpt-5.4-mini')

    expect(limits.maxTokens).toBe(400000)
    expect(limits.responseTokens).toBe(128000)
    expect(limits.knowledgeCutOff).toBe('2025-08-31')
    expect(limits.requestTokens).toBe(400000 - 128000 - 100)
  })

  test('GPT-5.4-nanoモデルの設定が正しく適用される', () => {
    const limits = new TokenLimits('gpt-5.4-nano')

    expect(limits.maxTokens).toBe(400000)
    expect(limits.responseTokens).toBe(128000)
    expect(limits.knowledgeCutOff).toBe('2025-08-31')
    expect(limits.requestTokens).toBe(400000 - 128000 - 100)
  })

  test('未知のモデルはGPT-5系デフォルト値を使用する', () => {
    const limits = new TokenLimits('unknown-model')

    expect(limits.maxTokens).toBe(400000)
    expect(limits.responseTokens).toBe(128000)
    expect(limits.knowledgeCutOff).toBe('2024-08-01')
  })

  test('string()メソッドが正しいフォーマットを返す', () => {
    const limits = new TokenLimits('gpt-5.4-mini')
    const result = limits.string()

    expect(result).toBe('max_tokens=400000, request_tokens=271900, response_tokens=128000')
  })

  test('GPT-5.4のstring()メソッドが正しいフォーマットを返す', () => {
    const limits = new TokenLimits('gpt-5.4')
    const result = limits.string()

    expect(result).toBe('max_tokens=1050000, request_tokens=921900, response_tokens=128000')
  })
})
