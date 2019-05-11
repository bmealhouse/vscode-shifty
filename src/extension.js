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
const {activateShiftInterval, stopShiftInterval} = require('./shift-interval')
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
      await favoriteFontFamily()
      await favoriteColorTheme()
    }),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('shifty.ignoreBoth', async () => {
      await ignoreFontFamily()
      await ignoreColorTheme()
    }),
  )
}

exports.activate = activate

function deactivate() {
  stopShiftInterval()
}
