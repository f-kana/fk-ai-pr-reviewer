import {describe, it, expect} from '@jest/globals'
import dotenv from 'dotenv'

import {Options, OpenAIOptions} from '../../src/options'
import {OpenAIClient} from '../../src/openai-client'
import {TokenLimits} from '../../src/limits'

// GPT-5 向け API 結合テスト: RUN_OPENAI_API_TESTS=1 かつ .env に OPENAI_API_KEY が存在する場合のみ実行
// コスト発生に注意。
describe('External Integration Test (GPT-5)', () => {
  dotenv.config({override: false})
  const hasKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')
  if (!process.env.RUN_OPENAI_API_TESTS) {
    it.skip('Skip GPT-5 OpenAI API test (flag not set).', () => {})
    return
  }
  if (!hasKey) {
    it.skip('Skip GPT-5 OpenAI API test (valid OPENAI_API_KEY not provided).', () => {})
    return
  }

  it('calls GPT-5 model and receives non-empty response', async () => {
    // gpt-5 モデル用に Options/TokenLimits を明示設定
    const options = new Options(
      false,
      false,
      true,
      '5',
      false,
      false,
      null,
      'You are an automated test.',
      'gpt-5',
      'gpt-5',
      '0.0',
      '2',
      '60000',
      '2',
      '2',
      'https://api.openai.com/v1',
      'en-US'
    )
    const tokenLimits = new TokenLimits('gpt-5')
    const openaiOptions = new OpenAIOptions('gpt-5', tokenLimits)

    const client = new OpenAIClient({
      apiKey: process.env.OPENAI_API_KEY!,
      apiOrg: process.env.OPENAI_API_ORG,
      apiBaseUrl: options.apiBaseUrl,
      model: openaiOptions.model,
      temperature: options.openaiModelTemperature,
      maxTokens: openaiOptions.tokenLimits.responseTokens,
      debug: false
    })

    const response = await client.sendMessage('Return the single word: ok')
    expect(response.text).toBeDefined()
    expect(response.text.length).toBeGreaterThan(0)
  })
})
