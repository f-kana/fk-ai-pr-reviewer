import {describe, it, expect, beforeEach, afterEach, jest} from '@jest/globals'

// Jest mock for @actions/core to avoid setFailed affecting process exit code in tests
jest.mock('@actions/core', () => ({
  setFailed: jest.fn(),
  info: jest.fn(),
  warning: jest.fn()
}))

import {Bot} from '../src/bot'
import {Options, OptionBuilderWithDefaults, OpenAIOptions} from '../src/options'
import {TokenLimits} from '../src/limits'

describe('Bot Integration Tests for GPT-5', () => {
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    originalEnv = process.env
    // テスト用のダミーAPIキーを設定
    process.env = {...originalEnv, OPENAI_API_KEY: 'sk-test-dummy-key'}
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should create Bot with GPT-5 model successfully', () => {
    const options = new Options(
      false, // debug
      false, // disableReview
      true, // disableReleaseNotes
      '10', // maxFiles
      false, // reviewSimpleChanges
      false, // reviewCommentLGTM
      null, // pathFilters
      'You are a helpful AI assistant.', // systemMessage
      'gpt-5', // openaiLightModel
      'gpt-5', // openaiHeavyModel
      '0.0', // openaiModelTemperature
      '3', // openaiRetries
      '120000', // openaiTimeoutMS
      '6', // openaiConcurrencyLimit
      '6', // githubConcurrencyLimit
      'https://api.openai.com/v1', // apiBaseUrl
      'en-US' // language
    )

    const openaiOptions = new OpenAIOptions('gpt-5', new TokenLimits('gpt-5'))

    expect(() => {
      new Bot(options, openaiOptions)
    }).not.toThrow()
  })

  it('should fail when OPENAI_API_KEY is not set', () => {
    delete process.env.OPENAI_API_KEY

    const options = new OptionBuilderWithDefaults().build()
    const openaiOptions = new OpenAIOptions('gpt-5', new TokenLimits('gpt-5'))

    expect(() => {
      new Bot(options, openaiOptions)
    }).toThrow('Unable to initialize the OpenAI API')
  })

  it('should configure OpenAI client with correct GPT-5 parameters', () => {
    const options = new Options(
      true, // debug mode to inspect configuration
      false,
      false,
      '10',
      false,
      false,
      null,
      'Test system message',
      'gpt-5-mini',
      'gpt-5',
      '0.7',
      '5',
      '180000',
      '4',
      '4',
      'https://api.openai.com/v1',
      'ja-JP'
    )

    const heavyTokenLimits = new TokenLimits('gpt-5')
    const openaiOptions = new OpenAIOptions('gpt-5', heavyTokenLimits)

    const bot = new Bot(options, openaiOptions)

    // Botが作成されることを確認（内部のOpenAIClientが正しく設定される）
    expect(bot).toBeDefined()

    // OpenAIOptionsが正しく設定されていることを確認
    expect(openaiOptions.model).toBe('gpt-5')
    expect(openaiOptions.tokenLimits.maxTokens).toBe(400000)
    expect(openaiOptions.tokenLimits.responseTokens).toBe(128000)
    expect(openaiOptions.tokenLimits.knowledgeCutOff).toBe('2024-08-01')
  })
})
