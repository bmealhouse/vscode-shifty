/**
 * Wires in Jest as the test runner in place of the default Mocha.
 */
import * as path from 'path'
import {runCLI} from '@jest/core'
import {AggregatedResult} from '@jest/test-result'
import * as sourceMapSupport from 'source-map-support'
import {
  bold,
  black,
  green,
  purple,
  red,
  yellow,
  darkGray,
  greenBg,
  redBg,
} from './debug-console-formatting'

const rootDir = path.resolve(__dirname, '../../')
const fromRoot = (...subPaths: string[]): string =>
  path.resolve(rootDir, ...subPaths)
// const srcRoot = fromRoot('src')

export async function run(
  _testRoot: string,
  callback: TestRunnerCallback,
): Promise<void> {
  // Enable source map support. This is done in the original Mocha test runner,
  // so do it here. It is not clear if this is having any effect.
  sourceMapSupport.install()

  // Forward logging from Jest to the Debug Console.
  forwardStdoutStderrStreams()

  try {
    const {results} = await runCLI(
      {
        _: [],
        $0: '',
        rootDir,
        roots: ['<rootDir>/src'],
        verbose: true,
        colors: true,
        transform: JSON.stringify({'^.+\\.ts$': 'ts-jest'}),
        runInBand: true, // Required due to the way the "vscode" module is injected.
        testRegex: process.env.TEST_FILE || '\\.(test|spec)\\.ts$', // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing
        testEnvironment: 'vscode',
        setupFilesAfterEnv: [
          fromRoot('dist/test/jest-vscode-framework-setup.js'),
        ],
        moduleFileExtensions: ['ts', 'js'],
      },
      [rootDir],
    )
    const failures = collectTestFailureMessages(results)

    if (failures.length > 0) {
      callback(null, failures)
      return
    }

    callback(null)
  } catch (error) {
    callback(error)
  }
}

/**
 * Collect failure messages from Jest test results.
 *
 * @param results Jest test results.
 */
function collectTestFailureMessages(results: AggregatedResult): string[] {
  const failures = results.testResults.reduce<string[]>((acc, testResult) => {
    if (testResult.failureMessage) acc.push(testResult.failureMessage)
    return acc
  }, [])

  return failures
}

/**
 * Forward writes to process.stdout and process.stderr to console.log.
 *
 * For some reason this seems to be required for the Jest output to be streamed
 * to the Debug Console.
 */
function forwardStdoutStderrStreams(): void {
  const logger = (text: string): boolean => {
    const formattedText = text.replace(/\n$/, '')

    if (formattedText.includes('✓')) {
      console.log(
        `  ${green('✓')} ${darkGray(formattedText.replace(/✓/, '').trim())}`,
      )
      return true
    }

    if (formattedText.includes('✕')) {
      console.log(
        `  ${red('✕')} ${darkGray(formattedText.replace(/✕/, '').trim())}`,
      )
      return true
    }

    if (formattedText.includes('○')) {
      console.log(
        `  ${yellow('○')} ${darkGray(formattedText.replace(/○/, '').trim())}`,
      )
      return true
    }

    if (formattedText.includes('✎')) {
      console.log(
        `  ${purple('✎')} ${darkGray(formattedText.replace(/✎/, '').trim())}`,
      )
      return true
    }

    if (formattedText.includes('●')) {
      console.log(red(formattedText))
      return true
    }

    if (formattedText.startsWith('PASS') || formattedText.startsWith('FAIL')) {
      const filepath = formattedText.replace(/^(PASS|FAIL)/, '').trim()
      const [testFilename, ...testPathParts] = filepath.split('/').reverse()
      const testPath = testPathParts.reverse().join('/')

      if (formattedText.startsWith('PASS')) {
        console.log(
          `${bold(greenBg(black(' PASS ')))} ${darkGray(`${testPath}/`)}${bold(
            testFilename,
          )}`,
        )
      }

      if (formattedText.startsWith('FAIL')) {
        console.log(
          `${bold(redBg(black(' FAIL ')))} ${darkGray(`${testPath}/`)}${bold(
            testFilename,
          )}`,
        )
      }

      return true
    }

    if (formattedText.includes('\n')) {
      const summary = []
      for (let line of formattedText.split('\n')) {
        if (line.includes('Ran all test suites.')) {
          summary.push(darkGray(line))
          continue
        }

        if (line.includes('Test Suites:')) {
          line = line.replace('Test Suites:', bold('Test Suites:'))
        }

        if (line.includes('Tests:')) {
          line = line.replace('Tests:', bold('Tests:'))
        }

        if (line.includes('Snapshots:')) {
          line = line.replace('Snapshots:', bold('Snapshots:'))
        }

        if (line.includes('Time:')) {
          line = line.replace('Time:', bold('Time:'))
        }

        if (line.includes('passed')) {
          line = line.replace(
            /(?<num>\d*) passed/,
            bold(green('$<num> passed')),
          )
        }

        if (line.includes('todo')) {
          line = line.replace(/(?<num>\d*) todo/, bold(purple('$<num> todo')))
        }

        if (line.includes('skipped')) {
          line = line.replace(
            /(?<num>\d*) skipped/,
            bold(yellow('$<num> skipped')),
          )
        }

        if (line.includes('failed')) {
          line = line.replace(/(?<num>\d*) failed/, bold(red('$<num> failed')))
        }

        summary.push(line)
      }

      console.log(summary.join('\n'))
      return true
    }

    console.log(formattedText)
    return true
  }

  process.stdout.write = logger
  process.stderr.write = logger
}

export type TestRunnerCallback = (error: Error | null, failures?: any) => void
