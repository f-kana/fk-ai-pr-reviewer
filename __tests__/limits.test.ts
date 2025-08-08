import { describe, test, expect } from '@jest/globals'
import { TokenLimits } from '../src/limits'

describe('TokenLimits tests', () => {
  test('GPT-4oモデルのknowledge cutoffが更新される', () => {
    const limits = new TokenLimits('gpt-4o')
    
    expect(limits.maxTokens).toBe(128000)
    expect(limits.responseTokens).toBe(4000)
    expect(limits.knowledgeCutOff).toBe('2024-04-01')
  })

  test('古いモデルのknowledge cutoffは変更されない', () => {
    const limits = new TokenLimits('gpt-4')
    
    expect(limits.maxTokens).toBe(8000)
    expect(limits.responseTokens).toBe(2000)
    expect(limits.knowledgeCutOff).toBe('2021-09-01')
  })

  test('未知のモデルはデフォルト値を使用する', () => {
    const limits = new TokenLimits('unknown-model')
    
    expect(limits.maxTokens).toBe(4000)
    expect(limits.responseTokens).toBe(1000)
    expect(limits.knowledgeCutOff).toBe('2021-09-01')
  })

  test('string()メソッドが正しいフォーマットを返す', () => {
    const limits = new TokenLimits('gpt-4o')
    const result = limits.string()
    
    expect(result).toBe('max_tokens=128000, request_tokens=123900, response_tokens=4000')
  })
})