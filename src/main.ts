import {getInput, setFailed, warning} from '@actions/core'
import {Bot} from './bot'
import {OpenAIOptions, Options, OptionBuilderFromGhaYml} from './options'
import {Prompts} from './prompts'
import {codeReview} from './review'
import {handleReviewComment} from './review-comment'

async function run(): Promise<void> {
  const options: Options = new OptionBuilderFromGhaYml().build()

  // print options
  options.print()

  const prompts: Prompts = new Prompts(getInput('summarize'), getInput('summarize_release_notes'))

  // Create two bots, one for summary and one for review

  let lightBot: Bot | null = null
  try {
    lightBot = new Bot(options, new OpenAIOptions(options.openaiLightModel, options.lightTokenLimits))
  } catch (e: any) {
    warning(`Skipped: failed to create summary bot, please check your openai_api_key: ${e}, backtrace: ${e.stack}`)
    return
  }

  let heavyBot: Bot | null = null
  try {
    heavyBot = new Bot(options, new OpenAIOptions(options.openaiHeavyModel, options.heavyTokenLimits))
  } catch (e: any) {
    warning(`Skipped: failed to create review bot, please check your openai_api_key: ${e}, backtrace: ${e.stack}`)
    return
  }

  try {
    // check if the event is pull_request
    if (process.env.GITHUB_EVENT_NAME === 'pull_request' || process.env.GITHUB_EVENT_NAME === 'pull_request_target') {
      await codeReview(lightBot, heavyBot, options, prompts)
    } else if (process.env.GITHUB_EVENT_NAME === 'pull_request_review_comment') {
      await handleReviewComment(heavyBot, options, prompts)
    } else {
      warning('Skipped: this action only works on push events or pull_request')
    }
  } catch (e: any) {
    if (e instanceof Error) {
      setFailed(`Failed to run: ${e.message}, backtrace: ${e.stack}`)
    } else {
      setFailed(`Failed to run: ${e}, backtrace: ${e.stack}`)
    }
  }
}

process
  .on('unhandledRejection', (reason, p) => {
    warning(`Unhandled Rejection at Promise: ${reason}, promise is ${p}`)
  })
  .on('uncaughtException', (e: any) => {
    warning(`Uncaught Exception thrown: ${e}, backtrace: ${e.stack}`)
  })

await run()
