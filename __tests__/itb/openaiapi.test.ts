import {describe, it, expect} from '@jest/globals'
import dotenv from 'dotenv'

import {OptionBuilderWithDefaults, ChatGptApiWrapperBuilder, OpenAIOptions} from '../../src/options'

/// OpenAI APIとの接続テスト。オプション付で、`RUN_OPENAI_API_TESTS=1 npm test`としたときのみ実行可能。お金がかかるので。
describe('External Integration Tests (ITb) with OpenAI API', () => {
  dotenv.config({override: false})
  if (!process.env.RUN_OPENAI_API_TESTS) {
    it.skip('Skip OpenAI API test.', () => {})
  } else {
    it('should run expensive API call', async () => {
      const options = new OptionBuilderWithDefaults().build()
      const openaiOptions = new OpenAIOptions(options.openaiLightModel, options.lightTokenLimits)
      const apiWrapper = new ChatGptApiWrapperBuilder(options, openaiOptions).build()
      const message = 'Say this is a test!'

      const response = await apiWrapper!.sendMessage(message)
      console.log(response)
    })
  }
})
