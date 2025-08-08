import {info, setFailed, warning} from '@actions/core'
import pRetry from 'p-retry'
import {OpenAIOptions, Options} from './options'
import {OpenAIClient, OpenAIResponse} from './openai-client'

// define type to save parentMessageId and conversationId
export interface Ids {
  parentMessageId?: string
  conversationId?: string
}

export class Bot {
  private readonly openaiClient: OpenAIClient
  private readonly options: Options
  private readonly openaiOptions: OpenAIOptions
  private readonly systemMessage: string

  constructor(options: Options, openaiOptions: OpenAIOptions) {
    if (!process.env.OPENAI_API_KEY) {
      const err = "Unable to initialize the OpenAI API, both 'OPENAI_API_KEY' environment variable are not available"
      setFailed(err)
      throw new Error(err)
    }

    this.options = options
    this.openaiOptions = openaiOptions
    
    // システムメッセージを構築
    const currentDate = new Date().toISOString().split('T')[0]
    this.systemMessage = `${options.systemMessage}
Knowledge cutoff: ${openaiOptions.tokenLimits.knowledgeCutOff}
Current date: ${currentDate}

IMPORTANT: Entire response must be in the language with ISO code: ${options.language}
`

    this.openaiClient = new OpenAIClient({
      apiKey: process.env.OPENAI_API_KEY,
      apiOrg: process.env.OPENAI_API_ORG,
      apiBaseUrl: options.apiBaseUrl,
      model: openaiOptions.model,
      temperature: options.openaiModelTemperature,
      maxTokens: openaiOptions.tokenLimits.responseTokens,
      debug: options.debug
    })
  }

  chat = async (message: string, ids: Ids): Promise<[string, Ids]> => {
    let res: [string, Ids] = ['', {}]
    try {
      res = await this.chat_(message, ids)
      return res
    } catch (e: unknown) {
      const errorMessage = `Failed to chat with OpenAI: ${e}`
      setFailed(errorMessage)
      warning(errorMessage)
      return res
    }
  }

  private readonly chat_ = async (message: string, ids: Ids): Promise<[string, Ids]> => {
    // record timing
    const start = Date.now()
    if (!message) {
      return ['', {}]
    }

    let response: OpenAIResponse | undefined

    try {
      response = await pRetry(() => this.openaiClient.sendMessage(message, this.systemMessage), {
        retries: this.options.openaiRetries
      })
    } catch (e: unknown) {
      const errorMessage = `Failed to send message to OpenAI: ${e}`
      info(`response: ${response}, failed to send message to openai: ${e}`)
      setFailed(errorMessage)
      throw e
    }
    
    const end = Date.now()
    info(`response: ${JSON.stringify(response)}`)
    info(`openai sendMessage (including retries) response time: ${end - start} ms`)

    let responseText = ''
    if (response != null) {
      responseText = response.text
    } else {
      const errorMessage = 'OpenAI response is null'
      setFailed(errorMessage)
      warning(errorMessage)
    }
    
    // remove the prefix "with " in the response
    if (responseText.startsWith('with ')) {
      responseText = responseText.substring(5)
    }
    
    if (this.options.debug) {
      info(`openai responses: ${responseText}`)
    }
    
    const newIds: Ids = {
      parentMessageId: response?.id,
      conversationId: response?.id // GPT-5では会話IDの概念が変わる可能性があるため、response IDを使用
    }
    
    return [responseText, newIds]
  }
}
