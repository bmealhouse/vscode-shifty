import * as os from 'os';
import * as vscode from 'vscode';
import commandMap from '../command-map';
import {getRandomItem} from '../utils';
import {codefaceFontFamilies} from './codeface-font-families';
import {systemFontFamilies} from './system-font-families';

// --- missing fonts ---
// 'AHAMONO'

export const enum FontFamilyPlatform {
  LINUX = 'Linux',
  MAC_OS = 'Darwin',
  WINDOWS = 'Windows_NT',
}

export const enum FontFamilyType {
  CODEFACE,
  SYSTEM,
  USER,
}

export interface FontFamily {
  id: string;
  supportedPlatforms: FontFamilyPlatform[];
  type: FontFamilyType;
}

export const DEFAULT_FONT_FAMILY = {
  id: 'Courier New',
  supportedPlatforms: [FontFamilyPlatform.MAC_OS, FontFamilyPlatform.WINDOWS],
  type: FontFamilyType.SYSTEM,
};

export const allFontFamilies = [...codefaceFontFamilies, ...systemFontFamilies];

let fontFamiliesCache: FontFamily[] | null = null;
export function _getFontFamiliesCache(): FontFamily[] | null {
  return fontFamiliesCache;
}

export function activateFontFamilies(context: vscode.ExtensionContext): void {
  primeFontFamiliesCache();

  context.subscriptions.push(
    vscode.commands.registerCommand(
      commandMap.SHIFT_FONT_FAMILY,
      shiftFontFamily,
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      commandMap.FAVORITE_FONT_FAMILY,
      async () => {
        const fontFamily = await favoriteFontFamily();
        vscode.window.showInformationMessage(
          `Added "${fontFamily}" to favorites`,
        );
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(commandMap.IGNORE_FONT_FAMILY, async () => {
      const fontFamily = await ignoreFontFamily();
      vscode.window.showInformationMessage(`Ignored "${fontFamily}"`);
    }),
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(event => {
      if (
        event.affectsConfiguration('shifty.fontFamilies') ||
        event.affectsConfiguration('shifty.shiftMode')
      ) {
        fontFamiliesCache = null;
        primeFontFamiliesCache();
      }
    }),
  );
}

export async function shiftFontFamily(): Promise<void> {
  const fontFamilies = getAvailableFontFamilies();
  const {id} = getRandomItem(fontFamilies);
  await setFontFamily(id);
}

export async function favoriteFontFamily(): Promise<string> {
  const fontFamily = getFontFamily();

  const config = vscode.workspace.getConfiguration('shifty.fontFamilies');
  await config.update(
    'favoriteFontFamilies',
    [...new Set([...(config.favoriteFontFamilies as string), fontFamily])].sort(
      (a, b) => a.localeCompare(b),
    ),
    true,
  );

  return fontFamily;
}

export async function ignoreFontFamily(): Promise<string> {
  const fontFamily = getFontFamily();

  const config = vscode.workspace.getConfiguration('shifty.fontFamilies');
  await config.update(
    'ignoreFontFamilies',
    [...new Set([...(config.ignoreFontFamilies as string), fontFamily])].sort(
      (a, b) => a.localeCompare(b),
    ),
    true,
  );
  await config.update(
    'favoriteFontFamilies',
    (config.favoriteFontFamilies as string[])
      .filter(ff => ff !== fontFamily)
      .sort((a, b) => a.localeCompare(b)),
    true,
  );

  await shiftFontFamily();
  return fontFamily;
}

export function getFontFamily(): string {
  const {fontFamily} = vscode.workspace.getConfiguration('editor');
  const [primaryFontFamily] = fontFamily.split(',');
  return primaryFontFamily.replace(/"/g, '');
}

export async function setFontFamily(fontFamily: string): Promise<void> {
  const {fallbackFontFamily} = vscode.workspace.getConfiguration(
    'shifty.fontFamilies',
  );

  const formattedFontFamily = /\s/.test(fontFamily)
    ? `"${fontFamily}"`
    : fontFamily;

  const fontFamilyWithFallback = fallbackFontFamily
    ? `${formattedFontFamily}, ${fallbackFontFamily}`
    : fontFamily;

  return vscode.workspace
    .getConfiguration('editor')
    .update(
      'fontFamily',
      fontFamilyWithFallback,
      vscode.ConfigurationTarget.Global,
    );
}

export function getAvailableFontFamilies(): FontFamily[] {
  if (fontFamiliesCache === null) {
    primeFontFamiliesCache();
  }

  const fontFamily = getFontFamily();
  return fontFamiliesCache!.filter(ff => ff.id !== fontFamily);
}

function primeFontFamiliesCache(): void {
  if (fontFamiliesCache !== null) return;

  const {
    shiftMode,
    fontFamilies: {
      favoriteFontFamilies,
      ignoreCodefaceFontFamilies,
      ignoreFontFamilies,
      includeFontFamilies,
    },
  } = vscode.workspace.getConfiguration('shifty');

  if (shiftMode === 'favorites') {
    fontFamiliesCache = favoriteFontFamilies.map((fontFamily: string) =>
      allFontFamilies.find(ff => ff.id === fontFamily),
    );
    return;
  }

  fontFamiliesCache = [
    ...allFontFamilies.filter(
      ff =>
        !(
          ignoreFontFamilies.includes(ff.id.replace(/"/g, '')) ||
          (ignoreCodefaceFontFamilies && ff.type === FontFamilyType.CODEFACE) ||
          (shiftMode === 'discovery' &&
            favoriteFontFamilies.includes(ff.id.replace(/"/g, ''))) ||
          !ff.supportedPlatforms.includes(os.type() as FontFamilyPlatform)
        ),
    ),
    ...includeFontFamilies.map(
      (ff: string): FontFamily => ({
        id: ff,
        supportedPlatforms: [
          FontFamilyPlatform.LINUX,
          FontFamilyPlatform.MAC_OS,
          FontFamilyPlatform.WINDOWS,
        ],
        type: FontFamilyType.USER,
      }),
    ),
  ];

  if (fontFamiliesCache.length === 0) {
    fontFamiliesCache = favoriteFontFamilies.map((fontFamily: string) =>
      allFontFamilies.find(ff => ff.id === fontFamily),
    );
  }

  if (fontFamiliesCache!.length === 0) {
    fontFamiliesCache = [DEFAULT_FONT_FAMILY];
  }
}
