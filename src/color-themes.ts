import * as vscode from 'vscode'
import commandMap from './command-map'
import {getRandomItem, localeCompare, unique} from './utils'

interface ColorTheme {
  id: string
  type: ColorThemeType
}

export const enum ColorThemeType {
  DARK = 'vs-dark',
  HIGH_CONTRAST = 'hc-black',
  LIGHT = 'vs',
}

export const DEFAULT_COLOR_THEME: ColorTheme = {
  id: 'Default Dark+',
  type: ColorThemeType.DARK,
}

let colorThemesCache: ColorTheme[]
export function getRawColorThemesCache(): ColorTheme[] {
  return colorThemesCache
}

export function activateColorThemes(context: vscode.ExtensionContext): void {
  primeColorThemesCache()

  context.subscriptions.push(
    vscode.commands.registerCommand(
      commandMap.SHIFT_COLOR_THEME,
      shiftColorTheme,
      // FEATURE REQUEST: Reset shift interval
    ),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand(
      commandMap.TOGGLE_FAVORITE_COLOR_THEME,
      async () => {
        const colorTheme = getColorTheme()

        if (hasFavoritedColorTheme(colorTheme)) {
          await unfavoriteColorTheme(colorTheme)
          vscode.window.showInformationMessage(
            `Removed "${colorTheme}" from favorites`,
          )
        } else {
          await favoriteColorTheme(colorTheme)
          vscode.window.showInformationMessage(
            `Added "${colorTheme}" to favorites`,
          )
        }
      },
    ),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand(commandMap.IGNORE_COLOR_THEME, async () => {
      const colorTheme = await ignoreColorTheme()
      vscode.window.showInformationMessage(`Ignored "${colorTheme}"`)
    }),
  )

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(handleDidChangeConfiguration),
  )

  context.subscriptions.push(
    vscode.extensions.onDidChange(() => {
      primeColorThemesCache()
    }),
  )
}

export function handleDidChangeConfiguration(
  event: vscode.ConfigurationChangeEvent,
): void {
  if (
    event.affectsConfiguration('shifty.colorThemes') ||
    event.affectsConfiguration('shifty.shiftMode')
  ) {
    primeColorThemesCache()
  }
}

export async function shiftColorTheme(): Promise<void> {
  const availableColorThemes = getAvailableColorThemes()
  const nextColorTheme = getRandomItem(availableColorThemes)
  await setColorTheme(nextColorTheme.id)
}

export function hasFavoritedColorTheme(colorTheme: string): boolean {
  const favoriteColorThemes = vscode.workspace
    .getConfiguration('shifty.colorThemes')
    .get<string[]>('favoriteColorThemes', [])

  return favoriteColorThemes.includes(colorTheme)
}

export async function favoriteColorTheme(colorTheme: string): Promise<void> {
  const config = vscode.workspace.getConfiguration('shifty.colorThemes')
  const favoriteColorThemes = config.get<string[]>('favoriteColorThemes', [])

  await config.update(
    'favoriteColorThemes',
    unique([...favoriteColorThemes, colorTheme]).sort(localeCompare),
    vscode.ConfigurationTarget.Global,
  )
}

export async function unfavoriteColorTheme(colorTheme: string): Promise<void> {
  const config = vscode.workspace.getConfiguration('shifty.colorThemes')
  const favoriteColorThemes = config.get<string[]>('favoriteColorThemes', [])

  await config.update(
    'favoriteColorThemes',
    unique(favoriteColorThemes.filter(ct => ct !== colorTheme)).sort(
      localeCompare,
    ),
    vscode.ConfigurationTarget.Global,
  )
}

export async function ignoreColorTheme(): Promise<string> {
  const colorTheme = getColorTheme()

  const config = vscode.workspace.getConfiguration('shifty.colorThemes')
  const ignoreColorThemes = config.get<string[]>('ignoreColorThemes', [])
  const favoriteColorThemes = config.get<string[]>('favoriteColorThemes', [])

  await config.update(
    'ignoreColorThemes',
    unique([...ignoreColorThemes, colorTheme]).sort(localeCompare),
    vscode.ConfigurationTarget.Global,
  )

  await config.update(
    'favoriteColorThemes',
    favoriteColorThemes.filter(ct => ct !== colorTheme).sort(localeCompare),
    vscode.ConfigurationTarget.Global,
  )

  await shiftColorTheme()
  return colorTheme
}

export function getColorTheme(): string {
  return vscode.workspace.getConfiguration('workbench').colorTheme
}

export async function setColorTheme(colorTheme: string): Promise<void> {
  const workbench = vscode.workspace.getConfiguration('workbench')

  return workbench.update(
    'colorTheme',
    colorTheme,
    vscode.ConfigurationTarget.Global,
  )
}

export function getAvailableColorThemes(): ColorTheme[] {
  const colorTheme = getColorTheme()
  return colorThemesCache.filter(ct => ct.id !== colorTheme)
}

function primeColorThemesCache(): void {
  const {
    shiftMode,
    colorThemes: {
      favoriteColorThemes,
      ignoreColorThemes,
      ignoreDarkColorThemes,
      ignoreHighContrastColorThemes,
      ignoreLightColorThemes,
    },
  } = vscode.workspace.getConfiguration('shifty')

  const allColorThemes = vscode.extensions.all.reduce(
    (colorThemes: ColorTheme[], extension) => {
      const {
        packageJSON: {contributes: {themes = []} = {}},
      } = extension

      return [
        ...colorThemes,
        ...themes.map(
          (theme: any): ColorTheme => ({
            id: theme.id || theme.label,
            type: theme.uiTheme as ColorThemeType,
          }),
        ),
      ]
    },
    [],
  )

  if (shiftMode === 'favorites') {
    colorThemesCache = favoriteColorThemes
      .map((id: string) => allColorThemes.find(ct => ct.id === id))
      .filter(Boolean)
      .filter(
        (ct: ColorTheme) =>
          !(
            (ignoreHighContrastColorThemes &&
              ct.type === ColorThemeType.HIGH_CONTRAST) ||
            (ignoreLightColorThemes && ct.type === ColorThemeType.LIGHT) ||
            (ignoreDarkColorThemes && ct.type === ColorThemeType.DARK)
          ),
      )
    return
  }

  colorThemesCache = allColorThemes.filter(
    ct =>
      !(
        ignoreColorThemes.includes(ct.id) ||
        (ignoreHighContrastColorThemes &&
          ct.type === ColorThemeType.HIGH_CONTRAST) ||
        (ignoreLightColorThemes && ct.type === ColorThemeType.LIGHT) ||
        (ignoreDarkColorThemes && ct.type === ColorThemeType.DARK) ||
        (shiftMode === 'discovery' && favoriteColorThemes.includes(ct.id))
      ),
  )

  if (colorThemesCache.length === 0) {
    colorThemesCache = favoriteColorThemes
      .map((id: string) => allColorThemes.find(ct => ct.id === id))
      .filter(Boolean)
      .filter(
        (ct: ColorTheme) =>
          !(
            (ignoreHighContrastColorThemes &&
              ct.type === ColorThemeType.HIGH_CONTRAST) ||
            (ignoreLightColorThemes && ct.type === ColorThemeType.LIGHT) ||
            (ignoreDarkColorThemes && ct.type === ColorThemeType.DARK)
          ),
      )
  }

  if (colorThemesCache!.length === 0) {
    colorThemesCache = [DEFAULT_COLOR_THEME]
  }
}
