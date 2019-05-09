const vscode = require('vscode')
const {shiftColorTheme} = require('./color-themes')
const {shiftFontFamily} = require('./font-families')

let shiftColorThemeIntervalId = null
let shiftColorThemeIntervalStartTime = null
let shiftFontFamilyIntervalId = null
let shiftFontFamilyIntervalStartTime = null

module.exports = {
  _getShiftIntervalIds,
  activateShiftInterval,
  startShiftInterval,
  stopShiftInterval,
  hasShiftIntervalStarted,
  getRemainingTimeForShiftIntervals,
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

  const startTime = Date.now()
  const shouldSyncStartTime =
    shiftColorThemeIntervalMs === shiftFontFamilyIntervalMs

  if (shiftColorThemeIntervalId === null && shiftColorThemeIntervalMs > 0) {
    shiftColorThemeIntervalStartTime = startTime
    shiftColorThemeIntervalId = setInterval(async () => {
      const nextStartTime = Date.now()
      await shiftColorTheme()

      shiftColorThemeIntervalStartTime = nextStartTime
      if (shouldSyncStartTime) {
        shiftFontFamilyIntervalStartTime = nextStartTime
      }
    }, shiftColorThemeIntervalMs)
  }

  if (shiftFontFamilyIntervalId === null && shiftFontFamilyIntervalMs > 0) {
    shiftFontFamilyIntervalStartTime = startTime
    shiftFontFamilyIntervalId = setInterval(async () => {
      const nextStartTime = Date.now()
      await shiftFontFamily()

      shiftFontFamilyIntervalStartTime = nextStartTime
      if (shouldSyncStartTime) {
        shiftColorThemeIntervalStartTime = nextStartTime
      }
    }, shiftFontFamilyIntervalMs)
  }
}

function stopShiftInterval() {
  if (shiftColorThemeIntervalId !== null) {
    clearInterval(shiftColorThemeIntervalId)
    shiftColorThemeIntervalId = null
    shiftColorThemeIntervalStartTime = null
  }

  if (shiftFontFamilyIntervalId !== null) {
    clearInterval(shiftFontFamilyIntervalId)
    shiftFontFamilyIntervalId = null
    shiftFontFamilyIntervalStartTime = null
  }
}

function hasShiftIntervalStarted() {
  return Boolean(shiftColorThemeIntervalId || shiftFontFamilyIntervalId)
}

function getRemainingTimeForShiftIntervals() {
  return {
    shiftColorThemeRemainingTime: calculateRemainingTime(
      shiftColorThemeIntervalStartTime,
      shiftColorThemeIntervalId,
    ),
    shiftFontFamilyRemainingTime: calculateRemainingTime(
      shiftFontFamilyIntervalStartTime,
      shiftFontFamilyIntervalId,
    ),
  }
}

function calculateRemainingTime(startTime, intervalId) {
  if (!startTime || !intervalId) return null

  const totalRemainingSeconds = Math.ceil(
    (startTime + intervalId._idleTimeout - Date.now()) / 1000,
  )

  const min = Math.floor(totalRemainingSeconds / 60)
  const sec = totalRemainingSeconds % 60
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function _getShiftIntervalIds() {
  return {
    shiftColorThemeIntervalId,
    shiftFontFamilyIntervalId,
  }
}
