const vscode = require('vscode')
const {activateColorThemes, setRandomColorTheme} = require('./color-themes')
const {activateFontFamilies, setRandomFontFamily} = require('./font-families')
const {activateShiftInterval, stopShiftInterval} = require('./shift-interval')

module.exports = {
  activate,
  deactivate,
}

async function activate(context) {
  const shifty = vscode.workspace.getConfiguration('shifty')

  if (!shifty.enabled) {
    await deactivate()
    return
  }

  await activateColorThemes(context)
  await activateFontFamilies(context)
  activateShiftInterval(context)

  context.subscriptions.push(
    vscode.commands.registerCommand('shifty.shiftAll', async () => {
      await setRandomColorTheme()
      await setRandomFontFamily()
    }),
  )

  // context.subscriptions.push(
  //   vscode.workspace.onDidChangeConfiguration(event => {
  //     console.log('shifty:workspace:onDidChangeConfiguration')
  //     console.log(event.affectsConfiguration('shifty.fontFamily'))
  //   }),
  // )

  context.subscriptions.push(
    vscode.extensions.onDidChange((...args) => {
      console.log('shifty:extension:onDidChange', args, JSON.stringify(args))
    }),
  )
}

exports.activate = activate

function deactivate() {
  stopShiftInterval()
}
