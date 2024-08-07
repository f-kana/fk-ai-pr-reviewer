import {
  getBooleanInput,
  getInput,
  getMultilineInput,
  info
} from '@actions/core'
import { ChatGPTAPI } from 'chatgpt'

import {minimatch} from 'minimatch'
import {TokenLimits} from './limits'

export class Options {
  debug: boolean
  disableReview: boolean
  disableReleaseNotes: boolean
  maxFiles: number
  reviewSimpleChanges: boolean
  reviewCommentLGTM: boolean
  pathFilters: PathFilter
  systemMessage: string
  openaiLightModel: string
  openaiHeavyModel: string
  openaiModelTemperature: number
  openaiRetries: number
  openaiTimeoutMS: number
  openaiConcurrencyLimit: number
  githubConcurrencyLimit: number
  lightTokenLimits: TokenLimits
  heavyTokenLimits: TokenLimits
  apiBaseUrl: string
  language: string

  constructor(
    debug: boolean = false,
    disableReview: boolean = false,
    disableReleaseNotes: boolean = true,
    maxFiles = '0',
    reviewSimpleChanges = false,
    reviewCommentLGTM = false,
    pathFilters: string[] | null = null,
    systemMessage = '',
    openaiLightModel = 'gpt-4o',
    openaiHeavyModel = 'gpt-4o',
    openaiModelTemperature = '0.0',
    openaiRetries = '3',
    openaiTimeoutMS = '120000',
    openaiConcurrencyLimit = '6',
    githubConcurrencyLimit = '6',
    apiBaseUrl = 'https://api.openai.com/v1',
    language = 'en-US' // or ja-JP
  ) {
    this.debug = debug
    this.disableReview = disableReview
    this.disableReleaseNotes = disableReleaseNotes
    this.maxFiles = parseInt(maxFiles)
    this.reviewSimpleChanges = reviewSimpleChanges
    this.reviewCommentLGTM = reviewCommentLGTM
    this.pathFilters = new PathFilter(pathFilters)
    this.systemMessage = systemMessage
    this.openaiLightModel = openaiLightModel
    this.openaiHeavyModel = openaiHeavyModel
    this.openaiModelTemperature = parseFloat(openaiModelTemperature)
    this.openaiRetries = parseInt(openaiRetries)
    this.openaiTimeoutMS = parseInt(openaiTimeoutMS)
    this.openaiConcurrencyLimit = parseInt(openaiConcurrencyLimit)
    this.githubConcurrencyLimit = parseInt(githubConcurrencyLimit)
    this.lightTokenLimits = new TokenLimits(openaiLightModel)
    this.heavyTokenLimits = new TokenLimits(openaiHeavyModel)
    this.apiBaseUrl = apiBaseUrl
    this.language = language
  }

  // print all options using core.info
  print(): void {
    info(`debug: ${this.debug}`)
    info(`disable_review: ${this.disableReview}`)
    info(`disable_release_notes: ${this.disableReleaseNotes}`)
    info(`max_files: ${this.maxFiles}`)
    info(`review_simple_changes: ${this.reviewSimpleChanges}`)
    info(`review_comment_lgtm: ${this.reviewCommentLGTM}`)
    info(`path_filters: ${this.pathFilters}`)
    info(`system_message: ${this.systemMessage}`)
    info(`openai_light_model: ${this.openaiLightModel}`)
    info(`openai_heavy_model: ${this.openaiHeavyModel}`)
    info(`openai_model_temperature: ${this.openaiModelTemperature}`)
    info(`openai_retries: ${this.openaiRetries}`)
    info(`openai_timeout_ms: ${this.openaiTimeoutMS}`)
    info(`openai_concurrency_limit: ${this.openaiConcurrencyLimit}`)
    info(`github_concurrency_limit: ${this.githubConcurrencyLimit}`)
    info(`summary_token_limits: ${this.lightTokenLimits.string()}`)
    info(`review_token_limits: ${this.heavyTokenLimits.string()}`)
    info(`api_base_url: ${this.apiBaseUrl}`)
    info(`language: ${this.language}`)
  }

  checkPath(path: string): boolean {
    const ok = this.pathFilters.check(path)
    info(`checking path: ${path} => ${ok}`)
    return ok
  }
}

/// GHA, OpenAI APIのオプション構築の基底クラス
/// コード整理のため抽象クラスに切り出してみたが、あまり意味はなかったので後で消すかも。
abstract class OptionBuilder {
  abstract build(): void
}

export class OptionBuilderWithDefaults extends OptionBuilder {
  build(): Options {
    const options: Options = new Options()
    return options
  }
}

export class OptionBuilderFromGhaYml extends OptionBuilder {
  build(): Options {
    const options: Options = new Options(
      getBooleanInput('debug'),
      getBooleanInput('disable_review'),
      getBooleanInput('disable_release_notes'),
      getInput('max_files'),
      getBooleanInput('review_simple_changes'),
      getBooleanInput('review_comment_lgtm'),
      getMultilineInput('path_filters'),
      getInput('system_message'),
      getInput('openai_light_model'),
      getInput('openai_heavy_model'),
      getInput('openai_model_temperature'),
      getInput('openai_retries'),
      getInput('openai_timeout_ms'),
      getInput('openai_concurrency_limit'),
      getInput('github_concurrency_limit'),
      getInput('openai_base_url'),
      getInput('language')
    )
    return options
  }
}

export class ChatGptApiWrapperBuilder {
  constructor(private readonly options: Options, private readonly openaiOptions: OpenAIOptions,) {}

  build(): ChatGPTAPI {
    const currentDate = new Date().toISOString().split('T')[0]
    const systemMessage = `${this.options.systemMessage}
Knowledge cutoff: ${this.openaiOptions.tokenLimits.knowledgeCutOff}
Current date: ${currentDate}

IMPORTANT: Entire response must be in the language with ISO code: ${this.options.language}
`
    return new ChatGPTAPI({
      apiBaseUrl: this.options.apiBaseUrl,
      systemMessage,
      apiKey: process.env.OPENAI_API_KEY ?? '',
      apiOrg: process.env.OPENAI_API_ORG ?? undefined,
      debug: this.options.debug,
      maxModelTokens: this.openaiOptions.tokenLimits.maxTokens,
      maxResponseTokens: this.openaiOptions.tokenLimits.responseTokens,
      completionParams: {
        temperature: this.options.openaiModelTemperature,
        model: this.openaiOptions.model
      }
    })
  }
}

export class PathFilter {
  private readonly rules: Array<[string /* rule */, boolean /* exclude */]>

  constructor(rules: string[] | null = null) {
    this.rules = []
    if (rules != null) {
      for (const rule of rules) {
        const trimmed = rule?.trim()
        if (trimmed) {
          if (trimmed.startsWith('!')) {
            this.rules.push([trimmed.substring(1).trim(), true])
          } else {
            this.rules.push([trimmed, false])
          }
        }
      }
    }
  }

  check(path: string): boolean {
    if (this.rules.length === 0) {
      return true
    }

    let included = false
    let excluded = false
    let inclusionRuleExists = false

    for (const [rule, exclude] of this.rules) {
      if (minimatch(path, rule)) {
        if (exclude) {
          excluded = true
        } else {
          included = true
        }
      }
      if (!exclude) {
        inclusionRuleExists = true
      }
    }

    return (!inclusionRuleExists || included) && !excluded
  }
}

export class OpenAIOptions {
  model: string
  tokenLimits: TokenLimits

  constructor(model = 'gpt-3.5-turbo', tokenLimits: TokenLimits | null = null) {
    this.model = model
    if (tokenLimits != null) {
      this.tokenLimits = tokenLimits
    } else {
      this.tokenLimits = new TokenLimits(model)
    }
  }
}
