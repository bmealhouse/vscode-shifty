const vscode = require('vscode')
const {getCurrentColorTheme} = require('./color-themes')
const {getCurrentFontFamily} = require('./font-families')
const {
  startShiftInterval,
  getRemainingTimeForShiftIntervals,
} = require('./shift-interval')

module.exports = {
  activateStatusBar,
}

let statusBar = null
const STATUS_BAR_COMMAND_ID = 'shifty.showCurrentStatus'
const STATUS_BAR_DISPLAY_TEXT = 'shifty'
const STATUS_BAR_PRIORITY = 0

function activateStatusBar(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand(STATUS_BAR_COMMAND_ID, () => {
      const {
        shiftColorThemeRemainingTime,
        shiftFontFamilyRemainingTime,
      } = getRemainingTimeForShiftIntervals()

      const messages = [
        shiftColorThemeRemainingTime &&
          !shiftFontFamilyRemainingTime &&
          `${shiftColorThemeRemainingTime} until color theme will shift`,
        !shiftColorThemeRemainingTime &&
          shiftFontFamilyRemainingTime &&
          `${shiftFontFamilyRemainingTime} until font family will shift`,
        shiftColorThemeRemainingTime &&
          shiftFontFamilyRemainingTime &&
          shiftColorThemeRemainingTime === shiftFontFamilyRemainingTime &&
          `${shiftColorThemeRemainingTime} until color theme & font family will shift`,
        ...(shiftColorThemeRemainingTime &&
        shiftFontFamilyRemainingTime &&
        shiftColorThemeRemainingTime !== shiftFontFamilyRemainingTime
          ? [
              `${shiftColorThemeRemainingTime} until color theme will shift`,
              `${shiftFontFamilyRemainingTime} until font family will shift`,
            ]
          : []),
        `Using "${getCurrentColorTheme()}" with "${getCurrentFontFamily()}" font family`,
      ].filter(Boolean)

      if (!shiftColorThemeRemainingTime && !shiftFontFamilyRemainingTime) {
        const cta = 'Start shift interval'
        vscode.window
          .showInformationMessage('Shift interval has not been started', cta)
          .then(action => {
            if (action === cta) {
              startShiftInterval()
            }
          })
      }

      messages.forEach(message => {
        vscode.window.showInformationMessage(message)
      })
    }),
  )

  statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    STATUS_BAR_PRIORITY,
  )
  statusBar.command = STATUS_BAR_COMMAND_ID
  statusBar.text = STATUS_BAR_DISPLAY_TEXT
  context.subscriptions.push(statusBar)

  statusBar.show()
}
