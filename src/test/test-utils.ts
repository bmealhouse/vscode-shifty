import * as vscode from 'vscode';
import {
  getColorTheme,
  setColorTheme,
  DEFAULT_COLOR_THEME,
} from '../color-themes';
import {
  FontFamilyPlatform,
  getFontFamily,
  setFontFamily,
  DEFAULT_FONT_FAMILY,
} from '../font-families';

export const DEFAULT_PLATFORM = FontFamilyPlatform.MAC_OS;

let originalConfig: any = {};
let originalColorTheme: string | null = null;
let originalFontFamily: string | null = null;

export async function setupTest(): Promise<void> {
  originalColorTheme = getColorTheme();
  await setColorTheme(DEFAULT_COLOR_THEME.id);

  originalFontFamily = getFontFamily();
  await setFontFamily(DEFAULT_FONT_FAMILY.id);

  await setDefault('shifty.shiftMode', 'default');
  await setDefault('shifty.colorThemes.favoriteColorThemes', []);
  await setDefault('shifty.colorThemes.ignoreColorThemes', []);
  await setDefault('shifty.colorThemes.ignoreDarkColorThemes', false);
  await setDefault('shifty.colorThemes.ignoreHighContrastColorThemes', false);
  await setDefault('shifty.colorThemes.ignoreLightColorThemes', false);
  await setDefault('shifty.fontFamilies.fallbackFontFamily', 'monospace');
  await setDefault('shifty.fontFamilies.favoriteFontFamilies', []);
  await setDefault('shifty.fontFamilies.ignoreCodefaceFontFamilies', false);
  await setDefault('shifty.fontFamilies.ignoreFontFamilies', []);
  await setDefault('shifty.fontFamilies.includeFontFamilies', []);
  await setDefault('shifty.shiftInterval.shiftColorThemeIntervalMin', 30);
  await setDefault('shifty.shiftInterval.shiftFontFamilyIntervalMin', 30);
}

export async function teardownTest(): Promise<void> {
  if (originalColorTheme) {
    await setColorTheme(originalColorTheme);
    originalColorTheme = null;
  }

  if (originalFontFamily) {
    await setFontFamily(originalFontFamily);
    originalFontFamily = null;
  }

  // restore original config
  await restoreOriginal('shifty.shiftMode');
  await restoreOriginal('shifty.colorThemes.favoriteColorThemes');
  await restoreOriginal('shifty.colorThemes.ignoreColorThemes');
  await restoreOriginal('shifty.colorThemes.ignoreDarkColorThemes');
  await restoreOriginal('shifty.colorThemes.ignoreHighContrastColorThemes');
  await restoreOriginal('shifty.colorThemes.ignoreLightColorThemes');
  await restoreOriginal('shifty.fontFamilies.fallbackFontFamily');
  await restoreOriginal('shifty.fontFamilies.favoriteFontFamilies');
  await restoreOriginal('shifty.fontFamilies.ignoreCodefaceFontFamilies');
  await restoreOriginal('shifty.fontFamilies.ignoreFontFamilies');
  await restoreOriginal('shifty.fontFamilies.includeFontFamilies');
  await restoreOriginal('shifty.shiftInterval.shiftColorThemeIntervalMin');
  await restoreOriginal('shifty.shiftInterval.shiftFontFamilyIntervalMin');
  originalConfig = {};
}

async function setDefault(keyPath: string, defaultValue: any): Promise<void> {
  const currentValue = await getConfig(keyPath);
  originalConfig[keyPath] = currentValue;

  if (Array.isArray(defaultValue)) {
    if (currentValue.length === 0) return;
  } else if (currentValue === defaultValue) {
    return;
  }

  await setConfig(keyPath, defaultValue);
}

async function restoreOriginal(keyPath: any): Promise<void> {
  const currentValue = getConfig(keyPath);
  const originalValue = originalConfig[keyPath];

  if (Array.isArray(currentValue)) {
    if (currentValue.length === 0 && originalValue.length === 0) return;
  } else if (currentValue === originalValue) {
    return;
  }

  await setConfig(keyPath, originalValue);
}

export function getConfig(keyPath: string): any {
  const [key, ...sections] = keyPath.split('.').reverse();
  const config = vscode.workspace.getConfiguration(
    sections.reverse().join('.'),
  );
  return config[key];
}

export async function setConfig(keyPath: string, value: any): Promise<void> {
  const [key, ...sections] = keyPath.split('.').reverse();
  const config = vscode.workspace.getConfiguration(
    sections.reverse().join('.'),
  );
  return config.update(key, value, true);
}

export function wait(ms: number): Promise<{}> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
