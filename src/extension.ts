import * as vscode from 'vscode';
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

export async function activate(
  context: vscode.ExtensionContext,
): Promise<void> {
  await activateColorThemes(context);
  await activateFontFamilies(context);
  // activateShiftInterval(context);
  // activateStatusBar(context);

  context.subscriptions.push(
    vscode.commands.registerCommand('shifty.shiftBoth', async () => {
      await shiftFontFamily();
      await shiftColorTheme();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('shifty.favoriteBoth', async () => {
      const fontFamily = await favoriteFontFamily();
      const colorTheme = await favoriteColorTheme();
      vscode.window.showInformationMessage(
        `Added "${colorTheme}" and "${fontFamily}" to favorites`,
      );
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('shifty.ignoreBoth', async () => {
      const fontFamily = await ignoreFontFamily();
      const colorTheme = await ignoreColorTheme();
      vscode.window.showInformationMessage(
        `Ignored "${colorTheme}" and "${fontFamily}"`,
      );
    }),
  );
}

export function deactivate(): void {
  // stopShiftInterval();
}
