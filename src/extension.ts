import * as vscode from 'vscode'
import commandMap from './command-map'
import {activateStatusBar} from './status-bar'
import {activateShiftInterval, deactivateShiftInterval} from './shift-interval'
import {activateColorThemes, shiftColorTheme} from './color-themes'
import {activateFontFamilies, shiftFontFamily} from './font-families'

export function activate(context: vscode.ExtensionContext): void {
  activateStatusBar(context)
  activateShiftInterval(context)
  activateColorThemes(context)
  activateFontFamilies(context)

  context.subscriptions.push(
    vscode.commands.registerCommand(commandMap.SHIFT, async () => {
      await shiftFontFamily()
      await shiftColorTheme()
      // FEATURE REQUEST: Reset shift interval
    }),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand(commandMap.ENABLE_DEBUGGING, () => {
      process.env.SHIFTY_DEBUG = 'true'
    }),
  )
}

export async function deactivate(): Promise<void> {
  await deactivateShiftInterval()
}
