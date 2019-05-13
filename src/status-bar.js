const vscode = require('vscode')
const {getColorTheme} = require('./color-themes')
const {getFontFamily} = require('./font-families')
const {getRemainingTimeForShiftIntervals} = require('./shift-interval')

module.exports = {
  activateStatusBar,
  updateStatusBarText,
}

let statusBar = null
const STATUS_BAR_COMMAND_ID = 'shifty.showStatus'
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
        FAVORITE_BOTH: 'Favorite both',
      }

      const actionCommandMap = {
        [actionTextMap.START_SHIFT_INTERVAL]: 'shifty.startShiftInterval',
        [actionTextMap.FAVORITE_COLOR_THEME]: 'shifty.favoriteColorTheme',
        [actionTextMap.FAVORITE_FONT_FAMILY]: 'shifty.favoriteFontFamily',
        [actionTextMap.FAVORITE_BOTH]: 'shifty.favoriteBoth',
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
          `Using "${getColorTheme()}" with "${getFontFamily()}" font family`,
          actionTextMap.FAVORITE_COLOR_THEME,
          actionTextMap.FAVORITE_FONT_FAMILY,
          actionTextMap.FAVORITE_BOTH,
        ],
      ].filter(Boolean)

      messages.forEach(message => {
        vscode.window.showInformationMessage(...message).then(action => {
          if (actionCommandMap[action]) {
            vscode.commands.executeCommand(actionCommandMap[action])
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

function updateStatusBarText(text) {
  statusBar.text = `${STATUS_BAR_DISPLAY_TEXT} ${text}`
}
