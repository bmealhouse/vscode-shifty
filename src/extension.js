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
      return Promise.all([shiftColorTheme(), shiftFontFamily()])
    }),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('shifty.favoriteBoth', async () => {
      return Promise.all([favoriteColorTheme(), favoriteFontFamily()])
    }),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('shifty.ignoreBoth', async () => {
      return Promise.all([ignoreColorTheme(), ignoreFontFamily()])
    }),
  )
}

exports.activate = activate

function deactivate() {
  stopShiftInterval()
}
