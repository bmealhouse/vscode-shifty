const vscode = require('vscode')
const {setRandomColorTheme} = require('./color-themes')
const {setRandomFontFamily} = require('./font-families')

let shiftColorThemeIntervalId = null
let shiftFontFamilyIntervalId = null

module.exports = {
  activateShiftInterval,
  startShiftInterval,
  stopShiftInterval,
  hasShiftIntervalStarted,
  __getShiftIntervalIds,
}

function activateShiftInterval(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'shifty.startShiftInterval',
      startShiftInterval,
    ),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'shifty.stopShiftInterval',
      stopShiftInterval,
    ),
  )

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(event => {
      if (
        event.affectsConfiguration('shifty.shiftInterval') &&
        hasShiftIntervalStarted()
      ) {
        stopShiftInterval()
        startShiftInterval()
      }
    }),
  )
}

async function startShiftInterval() {
  const {
    shiftColorThemeIntervalMs,
    shiftFontFamilyIntervalMs,
  } = vscode.workspace.getConfiguration('shifty.shiftInterval')

  if (shiftColorThemeIntervalMs > 0) {
    shiftColorThemeIntervalId = setInterval(
      setRandomColorTheme,
      shiftColorThemeIntervalMs,
    )
  }

  if (shiftFontFamilyIntervalMs > 0) {
    shiftFontFamilyIntervalId = setInterval(
      setRandomFontFamily,
      shiftFontFamilyIntervalMs,
    )
  }
}

function stopShiftInterval() {
  if (shiftColorThemeIntervalId !== null) {
    clearInterval(shiftColorThemeIntervalId)
    shiftColorThemeIntervalId = null
  }

  if (shiftFontFamilyIntervalId !== null) {
    clearInterval(shiftFontFamilyIntervalId)
    shiftFontFamilyIntervalId = null
  }
}

function hasShiftIntervalStarted() {
  return shiftColorThemeIntervalId || shiftFontFamilyIntervalId
}

function __getShiftIntervalIds() {
  return {
    shiftColorThemeIntervalId,
    shiftFontFamilyIntervalId,
  }
}
