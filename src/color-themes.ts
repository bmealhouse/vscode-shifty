import * as vscode from 'vscode';
import {getRandomItem} from './utils';

export const enum ColorThemeStyle {
  DARK = 'vs-dark',
  LIGHT = 'vs',
  HIGH_CONTRAST = 'hc-black',
}

interface ColorTheme {
  id: string;
  style: ColorThemeStyle;
}

export const DEFAULT_COLOR_THEME = {
  id: 'Default Dark+',
  style: ColorThemeStyle.DARK,
};

let colorThemesCache: ColorTheme[] | null = null;
export function _getColorThemesCache(): ColorTheme[] | null {
  return colorThemesCache;
}

export async function activateColorThemes(
  context: vscode.ExtensionContext,
): Promise<void> {
  primeColorThemesCache();
  await shiftColorThemeOnStartup();

  context.subscriptions.push(
    vscode.commands.registerCommand('shifty.shiftColorTheme', shiftColorTheme),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('shifty.favoriteColorTheme', async () => {
      const colorTheme = await favoriteColorTheme();
      vscode.window.showInformationMessage(
        `Added "${colorTheme}" to favorites`,
      );
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('shifty.ignoreColorTheme', async () => {
      const colorTheme = await ignoreColorTheme();
      vscode.window.showInformationMessage(`Ignored "${colorTheme}"`);
    }),
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(event => {
      if (
        event.affectsConfiguration('shifty.colorThemes') ||
        event.affectsConfiguration('shifty.shiftMode')
      ) {
        colorThemesCache = null;
        primeColorThemesCache();
      }
    }),
  );

  context.subscriptions.push(
    vscode.extensions.onDidChange(() => {
      colorThemesCache = null;
      primeColorThemesCache();
    }),
  );
}

export async function shiftColorTheme(): Promise<void> {
  const colorThemes = getAvailableColorThemes();
  const {id} = getRandomItem(colorThemes);
  await setColorTheme(id);
}

export async function shiftColorThemeOnStartup(): Promise<void> {
  const config = vscode.workspace.getConfiguration('shifty.startup');
  if (config.shiftColorThemeOnStartup) {
    await shiftColorTheme();
  }
}

export async function favoriteColorTheme(): Promise<string> {
  const colorTheme = getColorTheme();

  const config = vscode.workspace.getConfiguration('shifty.colorThemes');
  await config.update(
    'favoriteColorThemes',
    [
      ...new Set([...(config.favoriteColorThemes as string[]), colorTheme]),
    ].sort((a, b) => a.localeCompare(b)),
    true,
  );

  return colorTheme;
}

export async function ignoreColorTheme(): Promise<string> {
  const colorTheme = getColorTheme();

  const config = vscode.workspace.getConfiguration('shifty.colorThemes');
  await config.update(
    'ignoreColorThemes',
    [...new Set([...(config.ignoreColorThemes as string[]), colorTheme])].sort(
      (a, b) => a.localeCompare(b),
    ),
    true,
  );
  await config.update(
    'favoriteColorThemes',
    (config.favoriteColorThemes as string[])
      .filter(ct => ct !== colorTheme)
      .sort((a, b) => a.localeCompare(b)),
    true,
  );

  await shiftColorTheme();
  return colorTheme;
}

export function getColorTheme(): string {
  return vscode.workspace.getConfiguration('workbench').colorTheme;
}

export async function setColorTheme(colorTheme: string): Promise<void> {
  const workbench = vscode.workspace.getConfiguration('workbench');
  return workbench.update('colorTheme', colorTheme, true);
}

export function getAvailableColorThemes(): ColorTheme[] {
  if (colorThemesCache === null) {
    primeColorThemesCache();
  }

  const colorTheme = getColorTheme();
  return colorThemesCache!.filter(ct => ct.id !== colorTheme);
}

function primeColorThemesCache(): void {
  if (colorThemesCache !== null) return;

  const {
    shiftMode,
    colorThemes: {
      favoriteColorThemes,
      ignoreColorThemes,
      ignoreDarkColorThemes,
      ignoreHighContrastColorThemes,
      ignoreLightColorThemes,
    },
  } = vscode.workspace.getConfiguration('shifty');

  if (shiftMode === 'favorites') {
    colorThemesCache = favoriteColorThemes;
    return;
  }

  colorThemesCache = vscode.extensions.all
    .reduce((colorThemes: ColorTheme[], extension) => {
      const {
        packageJSON: {contributes: {themes = []} = {}},
      } = extension;

      // if (!themes) {
      //   return colorThemes;
      // }

      return [
        ...colorThemes,
        ...themes.map(
          (theme: any): ColorTheme => ({
            id: theme.id || theme.label,
            style: theme.uiTheme as ColorThemeStyle,
          }),
        ),
      ];
    }, [])
    .filter(
      ct =>
        !(
          ignoreColorThemes.includes(ct.id) ||
          (ignoreHighContrastColorThemes &&
            ct.style === ColorThemeStyle.HIGH_CONTRAST) ||
          (ignoreLightColorThemes && ct.style === ColorThemeStyle.LIGHT) ||
          (ignoreDarkColorThemes && ct.style === ColorThemeStyle.DARK) ||
          (shiftMode === 'discovery' && favoriteColorThemes.includes(ct.id))
        ),
    );

  if (colorThemesCache.length === 0) {
    colorThemesCache = favoriteColorThemes;
  }

  if (colorThemesCache!.length === 0) {
    colorThemesCache = [DEFAULT_COLOR_THEME];
  }
}
