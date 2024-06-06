import './fetch-polyfill'

import {info, setFailed, warning} from '@actions/core'
import {ChatGPTAPI, ChatGPTError, ChatMessage, SendMessageOptions} from 'chatgpt'
import pRetry from 'p-retry'
import {OpenAIOptions, Options, ChatGptApiWrapperBuilder} from './options'

// define type to save parentMessageId and conversationId
export interface Ids {
  parentMessageId?: string
  conversationId?: string
}

export class Bot {
  private readonly apiWrapper: ChatGPTAPI | null = null // not free

  private readonly options: Options

  constructor(options: Options, openaiOptions: OpenAIOptions) {
    if (!process.env.OPENAI_API_KEY) {
      const err = "Unable to initialize the OpenAI API, both 'OPENAI_API_KEY' environment variable are not available"
      throw new Error(err)
    }

    this.options = options
    this.apiWrapper = new ChatGptApiWrapperBuilder(options, openaiOptions).build()
  }

  chat = async (message: string, ids: Ids): Promise<[string, Ids]> => {
    let res: [string, Ids] = ['', {}]
    try {
      res = await this.chat_(message, ids)
      return res
    } catch (e: unknown) {
      if (e instanceof ChatGPTError) {
        warning(`Failed to chat: ${e}, backtrace: ${e.stack}`)
      }
      return res
    }
  }

  private readonly chat_ = async (message: string, ids: Ids): Promise<[string, Ids]> => {
    // record timing
    const start = Date.now()
    if (!message) {
      return ['', {}]
    }

    let response: ChatMessage | undefined

    if (this.apiWrapper != null) {
      // parentMessageIdはリファクタリングの余地がありそうだが、確証がないので一旦保留
      const opts: SendMessageOptions = {
        timeoutMs: this.options.openaiTimeoutMS
      }
      if (ids.parentMessageId) {
        opts.parentMessageId = ids.parentMessageId
      }
      try {
        response = await pRetry(() => this.apiWrapper!.sendMessage(message, opts), {
          retries: this.options.openaiRetries
        })
      } catch (e: unknown) {
        if (e instanceof ChatGPTError) {
          info(`response: ${response}, failed to send message to openai: ${e}, backtrace: ${e.stack}`)
        }
      }
      const end = Date.now()
      info(`response: ${JSON.stringify(response)}`)
      info(`openai sendMessage (including retries) response time: ${end - start} ms`)
    } else {
      setFailed('The OpenAI API is not initialized')
    }
    let responseText = ''
    if (response != null) {
      responseText = response.text
    } else {
      warning('openai response is null')
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
      conversationId: response?.conversationId
    }
    return [responseText, newIds]
  }
}
