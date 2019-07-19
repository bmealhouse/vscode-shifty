import * as vscode from 'vscode'
import {
  ColorThemeType,
  DEFAULT_COLOR_THEME,
  getColorTheme,
  getRawColorThemesCache,
  getAvailableColorThemes,
} from './color-themes'
import {updateConfig, formatSnapshot} from './test/test-utils'

test('registers color theme commands when VS Code starts up', async () => {
  const commands = await vscode.commands.getCommands()
  expect(commands).toContain('shifty.shiftColorTheme')
  expect(commands).toContain('shifty.favoriteColorTheme')
  expect(commands).toContain('shifty.ignoreColorTheme')
})

test('shifts the color theme when running the "shifty.shiftColorTheme" command', async () => {
  await vscode.commands.executeCommand('shifty.shiftColorTheme')
  expect(getColorTheme()).not.toBe(DEFAULT_COLOR_THEME.id)
})

test('favorites the current color theme when running the "shifty.favoriteColorTheme" command', async () => {
  const spy = jest.spyOn(vscode.window, 'showInformationMessage')
  await vscode.commands.executeCommand('shifty.favoriteColorTheme')

  const {favoriteColorThemes} = vscode.workspace.getConfiguration(
    'shifty.colorThemes',
  )
  expect(favoriteColorThemes).toContain(DEFAULT_COLOR_THEME.id)

  const [firstCall] = spy.mock.calls
  expect(formatSnapshot(firstCall)).toMatchInlineSnapshot(
    `"['Added \\"Default Dark+\\" to favorites']"`,
  )

  spy.mockRestore()
})

test('ignores the current color theme and shifts the color theme when running the "shifty.ignoreColorTheme" command', async () => {
  const spy = jest.spyOn(vscode.window, 'showInformationMessage')
  await vscode.commands.executeCommand('shifty.ignoreColorTheme')

  const {ignoreColorThemes} = vscode.workspace.getConfiguration(
    'shifty.colorThemes',
  )
  expect(ignoreColorThemes).toContain(DEFAULT_COLOR_THEME.id)

  const [firstCall] = spy.mock.calls
  expect(formatSnapshot(firstCall)).toMatchInlineSnapshot(
    `"['Ignored \\"Default Dark+\\"']"`,
  )

  expect(getColorTheme()).not.toBe(DEFAULT_COLOR_THEME.id)

  spy.mockRestore()
})

test('ignores the current color theme and removes the color theme from favorites when running the "shifty.ignoreColorTheme" command', async () => {
  const favorites = ['Abyss', DEFAULT_COLOR_THEME.id]
  await updateConfig('shifty.colorThemes.favoriteColorThemes', favorites)
  await vscode.commands.executeCommand('shifty.ignoreColorTheme')

  const {
    favoriteColorThemes,
    ignoreColorThemes,
  } = vscode.workspace.getConfiguration('shifty.colorThemes')

  expect(ignoreColorThemes).toContain(DEFAULT_COLOR_THEME.id)
  expect(favoriteColorThemes).not.toContain(DEFAULT_COLOR_THEME.id)
})

test('primes the color themes cache after the "shifty.colorThemes" config changes', async () => {
  const rawColorThemesCache = getRawColorThemesCache()
  await updateConfig('shifty.colorThemes.ignoreLightColorThemes', true)
  expect(getRawColorThemesCache()).not.toEqual(rawColorThemesCache)
})

test('returns all color themes when no color themes are ignored', async () => {
  // change any shifty.colorThemes config to prime the cache
  await updateConfig('shifty.colorThemes.favoriteColorThemes', [])

  const TOTAL_DEFAULT_VSCODE_THEMES = 14
  expect(getAvailableColorThemes().length).toBe(TOTAL_DEFAULT_VSCODE_THEMES - 1)
})

test('returns all color themes except the current color theme', async () => {
  // change any shifty.colorThemes config to prime the cache
  await updateConfig('shifty.colorThemes.favoriteColorThemes', [])

  expect(getAvailableColorThemes().map(ct => ct.id)).not.toContain(
    DEFAULT_COLOR_THEME.id,
  )
})

test('returns all color themes except the ignored color themes', async () => {
  const abyss = 'Abyss'
  await updateConfig('shifty.colorThemes.ignoreColorThemes', [abyss])
  expect(getAvailableColorThemes().map(ct => ct.id)).not.toContain(abyss)
})

test('returns no dark color themes when ignored', async () => {
  await updateConfig('shifty.colorThemes.ignoreDarkColorThemes', true)
  expect(
    getAvailableColorThemes().every(ct => ct.type !== ColorThemeType.DARK),
  ).toBeTruthy()
})

test('returns no dark color themes when ignored and in "favorites" mode', async () => {
  await updateConfig('shifty.shiftMode', 'favorites')
  const favorites = ['Abyss', 'Solarized Light', 'Default High Contrast']
  await updateConfig('shifty.colorThemes.favoriteColorThemes', favorites)
  await updateConfig('shifty.colorThemes.ignoreDarkColorThemes', true)

  expect(
    getAvailableColorThemes().every(ct => ct.type !== ColorThemeType.DARK),
  ).toBeTruthy()
})

test('returns no light color themes when ignored', async () => {
  await updateConfig('shifty.colorThemes.ignoreLightColorThemes', true)

  expect(
    getAvailableColorThemes().every(ct => ct.type !== ColorThemeType.LIGHT),
  ).toBeTruthy()
})

test('returns no light color themes when ignored and in "favorites" mode', async () => {
  await updateConfig('shifty.shiftMode', 'favorites')
  const favorites = ['Abyss', 'Solarized Light', 'Default High Contrast']
  await updateConfig('shifty.colorThemes.favoriteColorThemes', favorites)
  await updateConfig('shifty.colorThemes.ignoreLightColorThemes', true)

  expect(
    getAvailableColorThemes().every(ct => ct.type !== ColorThemeType.LIGHT),
  ).toBeTruthy()
})

test('returns no high contrast color themes when ignored', async () => {
  await updateConfig('shifty.colorThemes.ignoreHighContrastColorThemes', true)
  expect(
    getAvailableColorThemes().every(
      ct => ct.type !== ColorThemeType.HIGH_CONTRAST,
    ),
  ).toBeTruthy()
})

test('returns no hight contrast color themes when ignored and in "favorites" mode', async () => {
  await updateConfig('shifty.shiftMode', 'favorites')
  const favorites = ['Abyss', 'Solarized Light', 'Default High Contrast']
  await updateConfig('shifty.colorThemes.favoriteColorThemes', favorites)
  await updateConfig('shifty.colorThemes.ignoreHighContrastColorThemes', true)

  expect(
    getAvailableColorThemes().every(
      ct => ct.type !== ColorThemeType.HIGH_CONTRAST,
    ),
  ).toBeTruthy()
})

test('returns the default color theme when all color theme types are ignored', async () => {
  await updateConfig('shifty.colorThemes.ignoreDarkColorThemes', true)
  await updateConfig('shifty.colorThemes.ignoreLightColorThemes', true)
  await updateConfig('shifty.colorThemes.ignoreHighContrastColorThemes', true)
  expect(getRawColorThemesCache()).toEqual([DEFAULT_COLOR_THEME])
})

test('returns favorite color themes when shiftMode is set to "favorites"', async () => {
  const favorites = ['Abyss', 'Monokai Dimmed', 'Solarized Dark']
  await updateConfig('shifty.colorThemes.favoriteColorThemes', favorites)
  await updateConfig('shifty.shiftMode', 'favorites')
  expect(getAvailableColorThemes().map(ct => ct.id)).toEqual(favorites)
})

test('returns color themes without favorites when shiftMode is set to "discovery"', async () => {
  const abyss = 'Abyss'
  await updateConfig('shifty.colorThemes.favoriteColorThemes', [abyss])
  await updateConfig('shifty.shiftMode', 'discovery')
  expect(getAvailableColorThemes()).not.toContain(abyss)
})

test('returns favorite color themes when shiftMode is set to "discovery" and all color themes have been ignored or favorited', async () => {
  const favorites = ['Abyss', 'Monokai Dimmed', 'Solarized Dark']
  await updateConfig('shifty.colorThemes.favoriteColorThemes', favorites)
  await updateConfig('shifty.shiftMode', 'discovery')

  // ignore the rest of the available color themes
  await updateConfig('shifty.colorThemes.ignoreColorThemes', [
    ...getAvailableColorThemes().map(ct => ct.id),
    DEFAULT_COLOR_THEME.id,
  ])

  expect(getAvailableColorThemes().map(ct => ct.id)).toEqual(favorites)
})

test('returns the default VS Code color theme when shiftMode is set to "discovery" and all color themes have been ignored', async () => {
  await updateConfig('shifty.shiftMode', 'discovery')

  // ignore all color themes
  await updateConfig('shifty.colorThemes.ignoreColorThemes', [
    ...getAvailableColorThemes().map(ct => ct.id),
    DEFAULT_COLOR_THEME.id,
  ])

  expect(getRawColorThemesCache()).toEqual([DEFAULT_COLOR_THEME])
})
