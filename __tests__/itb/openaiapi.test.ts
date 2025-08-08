import {describe, it, expect} from '@jest/globals'
import dotenv from 'dotenv'

import {OptionBuilderWithDefaults, OpenAIOptions} from '../../src/options'
import {OpenAIClient} from '../../src/openai-client'

/// OpenAI APIとの接続テスト。オプション付で、`RUN_OPENAI_API_TESTS=1 npm test`としたときのみ実行可能。お金がかかるので。
describe('External Integration Tests (ITb) with OpenAI API', () => {
  dotenv.config({override: false})
  if (!process.env.RUN_OPENAI_API_TESTS) {
    it.skip('Skip OpenAI API test.', () => {})
  } else {
    it('Just confirm OpenAI API call', async () => {
      const options = new OptionBuilderWithDefaults().build()
      const openaiOptions = new OpenAIOptions(options.openaiLightModel, options.lightTokenLimits)

      const openaiClient = new OpenAIClient({
        apiKey: process.env.OPENAI_API_KEY!,
        apiOrg: process.env.OPENAI_API_ORG,
        apiBaseUrl: options.apiBaseUrl,
        model: openaiOptions.model,
        temperature: options.openaiModelTemperature,
        maxTokens: openaiOptions.tokenLimits.responseTokens,
        debug: options.debug
      })

      const message = 'Say this is a test!'

      const response = await openaiClient.sendMessage(message)
      console.log(response)
      expect(response.text).toBeDefined()
      expect(response.text.length).toBeGreaterThan(0)
    })
  }
})
