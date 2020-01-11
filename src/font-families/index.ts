import * as os from 'os'
import * as vscode from 'vscode'
import commandMap from '../command-map'
import {getRandomItem, localeCompare, unique} from '../utils'
import {codefaceFontFamilies} from './codeface-font-families'
import {systemFontFamilies} from './system-font-families'

export interface FontFamily {
  id: string
  supportedPlatforms: FontFamilyPlatform[]
  type: FontFamilyType
}

export const enum FontFamilyPlatform {
  LINUX = 'Linux',
  MAC_OS = 'Darwin',
  WINDOWS = 'Windows_NT',
}

export const enum FontFamilyType {
  CODEFACE = 'CODEFACE',
  SYSTEM = 'SYSTEM',
  USER = 'USER',
}

export const DEFAULT_FONT_FAMILY = {
  id: 'Courier New',
  supportedPlatforms: [FontFamilyPlatform.MAC_OS, FontFamilyPlatform.WINDOWS],
  type: FontFamilyType.SYSTEM,
}

let fontFamiliesCache: FontFamily[]
export function getRawFontFamiliesCache(): FontFamily[] {
  return fontFamiliesCache
}

export function activateFontFamilies(context: vscode.ExtensionContext): void {
  primeFontFamiliesCache()

  context.subscriptions.push(
    vscode.commands.registerCommand(commandMap.SHIFT_FONT_FAMILY, async () => {
      await shiftFontFamily()
      await vscode.commands.executeCommand(commandMap.RESET_SHIFT_INTERVAL)
    }),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand(
      commandMap.TOGGLE_FAVORITE_FONT_FAMILY,
      async () => {
        const fontFamily = getFontFamily()

        if (hasFavoritedFontFamily(fontFamily)) {
          await unfavoriteFontFamily(fontFamily)
          vscode.window.showInformationMessage(
            `Removed "${fontFamily}" from favorites`,
          )
        } else {
          await favoriteFontFamily(fontFamily)
          vscode.window.showInformationMessage(
            `Added "${fontFamily}" to favorites`,
          )
        }
      },
    ),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand(commandMap.IGNORE_FONT_FAMILY, async () => {
      const fontFamily = getFontFamily()
      await ignoreFontFamily(fontFamily)
      vscode.window.showInformationMessage(`Ignored "${fontFamily}"`)

      vscode.commands.executeCommand(commandMap.RESET_SHIFT_INTERVAL)
    }),
  )

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(handleDidChangeConfiguration),
  )
}

export function handleDidChangeConfiguration(
  event: vscode.ConfigurationChangeEvent,
): void {
  if (
    event.affectsConfiguration('shifty.fontFamilies') ||
    event.affectsConfiguration('shifty.shiftMode')
  ) {
    primeFontFamiliesCache()
  }
}

export async function shiftFontFamily(): Promise<void> {
  const availableFontFamilies = getAvailableFontFamilies()
  const nextFontFamily = getRandomItem(availableFontFamilies)
  await setFontFamily(nextFontFamily.id)
}

export function hasFavoritedFontFamily(fontFamily: string): boolean {
  const favoriteFontFamilies = vscode.workspace
    .getConfiguration('shifty.fontFamilies')
    .get<string[]>('favoriteFontFamilies', [])

  return favoriteFontFamilies.includes(fontFamily)
}

export async function favoriteFontFamily(fontFamily: string): Promise<void> {
  const config = vscode.workspace.getConfiguration('shifty.fontFamilies')
  const favoriteFontFamilies = config.get<string[]>('favoriteFontFamilies', [])

  await config.update(
    'favoriteFontFamilies',
    unique([...favoriteFontFamilies, fontFamily]).sort(localeCompare),
    vscode.ConfigurationTarget.Global,
  )
}

export async function unfavoriteFontFamily(fontFamily: string): Promise<void> {
  const config = vscode.workspace.getConfiguration('shifty.fontFamilies')
  const favoriteFontFamilies = config.get<string[]>('favoriteFontFamilies', [])

  await config.update(
    'favoriteFontFamilies',
    unique(favoriteFontFamilies.filter(ff => ff !== fontFamily)).sort(
      localeCompare,
    ),
    vscode.ConfigurationTarget.Global,
  )
}

export async function ignoreFontFamily(fontFamily: string): Promise<void> {
  const config = vscode.workspace.getConfiguration('shifty.fontFamilies')
  const favoriteFontFamilies = config.get<string[]>('favoriteFontFamilies', [])
  const ignoreFontFamilies = config.get<string[]>('ignoreFontFamilies', [])

  await config.update(
    'ignoreFontFamilies',
    unique([...ignoreFontFamilies, fontFamily]).sort(localeCompare),
    vscode.ConfigurationTarget.Global,
  )

  await config.update(
    'favoriteFontFamilies',
    favoriteFontFamilies.filter(ff => ff !== fontFamily).sort(localeCompare),
    vscode.ConfigurationTarget.Global,
  )

  await shiftFontFamily()
}

export function getFontFamily(): string {
  const {fontFamily} = vscode.workspace.getConfiguration('editor')
  const [mainFontFamily] = fontFamily.split(',')
  return mainFontFamily.replace(/"/g, '')
}

export async function setFontFamily(fontFamily: string): Promise<void> {
  const fallbackFontFamily = vscode.workspace
    .getConfiguration('shifty.fontFamilies')
    .get<string>('fallbackFontFamily', '')

  const formattedFontFamily = /\s/.test(fontFamily)
    ? `"${fontFamily}"`
    : fontFamily
  const fontFamilyWithFallback = `${formattedFontFamily}, ${fallbackFontFamily}`

  return vscode.workspace
    .getConfiguration('editor')
    .update(
      'fontFamily',
      fallbackFontFamily ? fontFamilyWithFallback : fontFamily,
      vscode.ConfigurationTarget.Global,
    )
}

export function getAvailableFontFamilies(): FontFamily[] {
  const fontFamily = getFontFamily()
  return fontFamiliesCache.filter(ff => ff.id !== fontFamily)
}

export function getAllFontFamilies(): FontFamily[] {
  const {includeFontFamilies} = vscode.workspace.getConfiguration(
    'shifty.fontFamilies',
  )

  return [
    ...codefaceFontFamilies,
    ...systemFontFamilies,
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
  ]
}

function primeFontFamiliesCache(): void {
  const {
    shiftMode,
    fontFamilies: {
      favoriteFontFamilies,
      ignoreCodefaceFontFamilies,
      ignoreFontFamilies,
    },
  } = vscode.workspace.getConfiguration('shifty')

  if (shiftMode === 'favorites') {
    fontFamiliesCache = favoriteFontFamilies.map(getFontFamilyById)
    return
  }

  fontFamiliesCache = getAllFontFamilies().filter(
    ff =>
      !(
        ignoreFontFamilies.includes(ff.id.replace(/"/g, '')) ||
        (ignoreCodefaceFontFamilies && ff.type === FontFamilyType.CODEFACE) ||
        (shiftMode === 'discovery' &&
          favoriteFontFamilies.includes(ff.id.replace(/"/g, ''))) ||
        !ff.supportedPlatforms.includes(os.type() as FontFamilyPlatform)
      ),
  )

  if (fontFamiliesCache.length === 0) {
    fontFamiliesCache = favoriteFontFamilies.map(getFontFamilyById)
  }

  if (fontFamiliesCache!.length === 0) {
    fontFamiliesCache = [DEFAULT_FONT_FAMILY]
  }
}

function getFontFamilyById(id: string): FontFamily | undefined {
  return getAllFontFamilies().find(ff => ff.id === id)
}
