import * as vscode from 'vscode';
import {getColorTheme} from './color-themes';
import {getFontFamily} from './font-families';
import {getRemainingTimeForShiftIntervals} from './shift-interval';

let statusBar = null;
const STATUS_BAR_COMMAND_ID = 'shifty.showStatus';
const STATUS_BAR_DISPLAY_TEXT = 'shifty';
const STATUS_BAR_PRIORITY = 0;

export function activateStatusBar(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand(STATUS_BAR_COMMAND_ID, () => {
      const {
        shiftColorThemeRemainingTime,
        shiftFontFamilyRemainingTime,
      } = getRemainingTimeForShiftIntervals();

      const actionTextMap = {
        START_SHIFT_INTERVAL: 'Start shift interval',
        FAVORITE_COLOR_THEME: 'Favorite color theme',
        FAVORITE_FONT_FAMILY: 'Favorite font family',
        FAVORITE_BOTH: 'Favorite both',
      };

      const actionCommandMap = {
        [actionTextMap.START_SHIFT_INTERVAL]: 'shifty.startShiftInterval',
        [actionTextMap.FAVORITE_COLOR_THEME]: 'shifty.favoriteColorTheme',
        [actionTextMap.FAVORITE_FONT_FAMILY]: 'shifty.favoriteFontFamily',
        [actionTextMap.FAVORITE_BOTH]: 'shifty.favoriteBoth',
      };

      interface Message {
        message: string;
        items?: string[];
      }

      const messages: Message[] = [];

      if (!shiftColorThemeRemainingTime && !shiftFontFamilyRemainingTime) {
        messages.push({
          message: 'Shift interval has not been started',
          items: [actionTextMap.START_SHIFT_INTERVAL],
        });
      }

      if (shiftColorThemeRemainingTime && !shiftFontFamilyRemainingTime) {
        messages.push({
          message: `${shiftColorThemeRemainingTime} until color theme will shift`,
        });
      }

      if (!shiftColorThemeRemainingTime && shiftFontFamilyRemainingTime) {
        messages.push({
          message: `${shiftFontFamilyRemainingTime} until font family will shift`,
        });
      }

      if (
        shiftColorThemeRemainingTime &&
        shiftFontFamilyRemainingTime &&
        shiftColorThemeRemainingTime === shiftFontFamilyRemainingTime
      ) {
        messages.push({
          message: `${shiftColorThemeRemainingTime} until color theme & font family will shift`,
        });
      }

      if (
        shiftColorThemeRemainingTime &&
        shiftFontFamilyRemainingTime &&
        shiftColorThemeRemainingTime !== shiftFontFamilyRemainingTime
      ) {
        messages.push({
          message: `${shiftColorThemeRemainingTime} until color theme will shift`,
        });
        messages.push({
          message: `${shiftFontFamilyRemainingTime} until font family will shift`,
        });
      }

      messages.push({
        message: `Using "${getColorTheme()}" with "${getFontFamily()}" font family`,
        items: [
          actionTextMap.FAVORITE_COLOR_THEME,
          actionTextMap.FAVORITE_FONT_FAMILY,
          actionTextMap.FAVORITE_BOTH,
        ],
      });

      messages.forEach(({message, items = []}) => {
        vscode.window.showInformationMessage(message, ...items).then(action => {
          if (action && actionCommandMap[action]) {
            vscode.commands.executeCommand(actionCommandMap[action]);
          }
        });
      });
    }),
  );

  statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    STATUS_BAR_PRIORITY,
  );
  statusBar.command = STATUS_BAR_COMMAND_ID;
  statusBar.text = STATUS_BAR_DISPLAY_TEXT;
  context.subscriptions.push(statusBar);

  statusBar.show();
}
