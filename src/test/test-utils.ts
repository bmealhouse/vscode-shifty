import * as vscode from 'vscode'
import waitForExpect from 'wait-for-expect'
import {handleDidChangeConfiguration as handleDidChangeColorThemeConfiguration} from '../color-themes'
import {handleDidChangeConfiguration as handleDidChangeFontFamilyConfiguration} from '../font-families'

export async function updateConfig(section: string, value: any): Promise<void> {
  const [sectionKey, ...sectionParts] = section.split('.').reverse()
  const config = vscode.workspace.getConfiguration(
    sectionParts.reverse().join('.'),
  )

  await config.update(sectionKey, value, vscode.ConfigurationTarget.Global)

  const event: vscode.ConfigurationChangeEvent = {
    affectsConfiguration(expectedSection) {
      return section.includes(expectedSection)
    },
  }

  // Simulate configuration change event
  handleDidChangeColorThemeConfiguration(event)
  handleDidChangeFontFamilyConfiguration(event)
}

export function formatSnapshot(data: any): string {
  return JSON.stringify(data)
    .replace(/([^\\])"/g, "$1'") // eslint-disable-line @typescript-eslint/quotes
    .replace(/\\"/g, '"')
}

export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

export async function wait(
  callback = () => {},
  {timeout = 4500, interval = 50} = {},
): Promise<any> {
  return waitForExpect(callback, timeout, interval)
}
