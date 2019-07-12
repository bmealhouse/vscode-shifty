import * as vscode from 'vscode';
import commandMap from './command-map';
import {activateStatusBar} from './status-bar';
import {activateShiftInterval, deactivateShiftInterval} from './shift-interval';
import {
  activateColorThemes,
  shiftColorTheme,
  favoriteColorTheme,
  ignoreColorTheme,
} from './color-themes';
import {
  activateFontFamilies,
  shiftFontFamily,
  favoriteFontFamily,
  ignoreFontFamily,
} from './font-families';

export function activate(context: vscode.ExtensionContext): void {
  activateStatusBar(context);
  activateShiftInterval(context);
  activateColorThemes(context);
  activateFontFamilies(context);

  context.subscriptions.push(
    vscode.commands.registerCommand(commandMap.SHIFT_BOTH, async () => {
      await shiftFontFamily();
      await shiftColorTheme();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(commandMap.FAVORITE_BOTH, async () => {
      const fontFamily = await favoriteFontFamily();
      const colorTheme = await favoriteColorTheme();
      vscode.window.showInformationMessage(
        `Added "${colorTheme}" and "${fontFamily}" to favorites`,
      );
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(commandMap.IGNORE_BOTH, async () => {
      const fontFamily = await ignoreFontFamily();
      const colorTheme = await ignoreColorTheme();
      vscode.window.showInformationMessage(
        `Ignored "${colorTheme}" and "${fontFamily}"`,
      );
    }),
  );
}

export async function deactivate(): Promise<void> {
  await deactivateShiftInterval();
}
