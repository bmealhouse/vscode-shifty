const vscode = require('vscode')
const {
  activateColorThemes,
  shiftColorTheme,
  favoriteColorTheme,
  ignoreColorTheme,
} = require('./color-themes')
const {
  activateFontFamilies,
  shiftFontFamily,
  favoriteFontFamily,
  ignoreFontFamily,
} = require('./font-families')
const {
  activateShiftInterval,
  deactivateShiftInterval,
} = require('./shift-interval')
const {activateStatusBar} = require('./status-bar')

module.exports = {
  activate,
  deactivate,
}

async function activate(context) {
  await activateColorThemes(context)
  await activateFontFamilies(context)
  activateShiftInterval(context)
  activateStatusBar(context)

  context.subscriptions.push(
    vscode.commands.registerCommand('shifty.shiftBoth', async () => {
      await shiftFontFamily()
      await shiftColorTheme()
    }),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('shifty.favoriteBoth', async () => {
      const fontFamily = await favoriteFontFamily()
      const colorTheme = await favoriteColorTheme()
      vscode.window.showInformationMessage(
        `Added "${colorTheme}" and "${fontFamily}" to favorites`,
      )
    }),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('shifty.ignoreBoth', async () => {
      const fontFamily = await ignoreFontFamily()
      const colorTheme = await ignoreColorTheme()
      vscode.window.showInformationMessage(
        `Ignored "${colorTheme}" and "${fontFamily}"`,
      )
    }),
  )
}

exports.activate = activate

function deactivate() {
  deactivateShiftInterval()
}
