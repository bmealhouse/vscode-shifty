const vscode = require('vscode')
const {
  getCurrentColorTheme,
  favoriteCurrentColorTheme,
} = require('./color-themes')
const {
  getCurrentFontFamily,
  favoriteCurrentFontFamily,
} = require('./font-families')
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

      const actionTextMap = {
        START_SHIFT_INTERVAL: 'Start shift interval',
        FAVORITE_COLOR_THEME: 'Favorite color theme',
        FAVORITE_FONT_FAMILY: 'Favorite font family',
      }

      const actionFuncMap = {
        'Start shift interval': startShiftInterval,
        'Favorite color theme': favoriteCurrentColorTheme,
        'Favorite font family': favoriteCurrentFontFamily,
      }

      const messages = [
        !shiftColorThemeRemainingTime &&
          !shiftFontFamilyRemainingTime && [
            'Shift interval has not been started',
            actionTextMap.START_SHIFT_INTERVAL,
          ],
        shiftColorThemeRemainingTime &&
          !shiftFontFamilyRemainingTime && [
            `${shiftColorThemeRemainingTime} until color theme will shift`,
          ],
        !shiftColorThemeRemainingTime &&
          shiftFontFamilyRemainingTime && [
            `${shiftFontFamilyRemainingTime} until font family will shift`,
          ],
        shiftColorThemeRemainingTime &&
          shiftFontFamilyRemainingTime &&
          shiftColorThemeRemainingTime === shiftFontFamilyRemainingTime && [
            `${shiftColorThemeRemainingTime} until color theme & font family will shift`,
          ],
        ...(shiftColorThemeRemainingTime &&
        shiftFontFamilyRemainingTime &&
        shiftColorThemeRemainingTime !== shiftFontFamilyRemainingTime
          ? [
              [`${shiftColorThemeRemainingTime} until color theme will shift`],
              [`${shiftFontFamilyRemainingTime} until font family will shift`],
            ]
          : []),
        [
          `Using "${getCurrentColorTheme()}" with "${getCurrentFontFamily()}" font family`,
          actionTextMap.FAVORITE_COLOR_THEME,
          actionTextMap.FAVORITE_FONT_FAMILY,
        ],
      ].filter(Boolean)

      messages.forEach(message => {
        vscode.window.showInformationMessage(...message).then(action => {
          if (actionFuncMap[action]) {
            actionFuncMap[action]()
          }
        })
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
