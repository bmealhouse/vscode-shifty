import * as vscode from 'vscode'
import {
  ColorThemeType,
  DEFAULT_COLOR_THEME,
  getColorTheme,
  getRawColorThemesCache,
  getAvailableColorThemes,
} from './color-themes'
import {updateConfig, formatSnapshot} from './test-utils'
import commandMap from './command-map'

test('registers color theme commands when VS Code starts up', async () => {
  const commands = await vscode.commands.getCommands()
  expect(commands).toContain(commandMap.SHIFT_COLOR_THEME)
  expect(commands).toContain(commandMap.TOGGLE_FAVORITE_COLOR_THEME)
  expect(commands).toContain(commandMap.IGNORE_COLOR_THEME)
})

test(`shifts the color theme when running the "commandMap.SHIFT_COLOR_THEME" command`, async () => {
  const spy = jest.spyOn(vscode.commands, 'executeCommand')
  await vscode.commands.executeCommand(commandMap.SHIFT_COLOR_THEME)

  expect(getColorTheme()).not.toBe(DEFAULT_COLOR_THEME.id)

  const [, secondCall] = spy.mock.calls
  expect(secondCall).toEqual([commandMap.RESET_SHIFT_INTERVAL])

  spy.mockRestore()
})

test(`favorites the current color theme when running the "commandMap.TOGGLE_FAVORITE_COLOR_THEME" command`, async () => {
  const spy = jest.spyOn(vscode.window, 'showInformationMessage')
  await vscode.commands.executeCommand(commandMap.TOGGLE_FAVORITE_COLOR_THEME)

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

test(`unfavorites the current color theme when running the "commandMap.TOGGLE_FAVORITE_COLOR_THEME" command`, async () => {
  const favorites = ['Abyss', DEFAULT_COLOR_THEME.id]
  await updateConfig('shifty.colorThemes.favoriteColorThemes', favorites)

  const spy = jest.spyOn(vscode.window, 'showInformationMessage')
  await vscode.commands.executeCommand(commandMap.TOGGLE_FAVORITE_COLOR_THEME)

  const {favoriteColorThemes} = vscode.workspace.getConfiguration(
    'shifty.colorThemes',
  )
  expect(favoriteColorThemes).not.toContain(DEFAULT_COLOR_THEME.id)

  const [firstCall] = spy.mock.calls
  expect(formatSnapshot(firstCall)).toMatchInlineSnapshot(
    `"['Removed \\"Default Dark+\\" from favorites']"`,
  )

  spy.mockRestore()
})

test(`ignores the current color theme, shifts the color theme, and resets the shift interval when running the "commandMap.IGNORE_COLOR_THEME" command`, async () => {
  const showInformationMessaageSpy = jest.spyOn(
    vscode.window,
    'showInformationMessage',
  )

  const executeCommandSpy = jest.spyOn(vscode.commands, 'executeCommand')
  await vscode.commands.executeCommand(commandMap.IGNORE_COLOR_THEME)

  const {ignoreColorThemes} = vscode.workspace.getConfiguration(
    'shifty.colorThemes',
  )
  expect(ignoreColorThemes).toContain(DEFAULT_COLOR_THEME.id)

  const [firstCall] = showInformationMessaageSpy.mock.calls
  expect(formatSnapshot(firstCall)).toMatchInlineSnapshot(
    `"['Ignored \\"Default Dark+\\"']"`,
  )

  expect(getColorTheme()).not.toBe(DEFAULT_COLOR_THEME.id)

  const [, secondCall] = executeCommandSpy.mock.calls
  expect(secondCall).toEqual([commandMap.RESET_SHIFT_INTERVAL])

  showInformationMessaageSpy.mockRestore()
  executeCommandSpy.mockRestore()
})

test(`ignores the current color theme and removes the color theme from favorites when running the "commandMap.IGNORE_COLOR_THEME" command`, async () => {
  const favorites = ['Abyss', DEFAULT_COLOR_THEME.id]
  await updateConfig('shifty.colorThemes.favoriteColorThemes', favorites)
  await vscode.commands.executeCommand(commandMap.IGNORE_COLOR_THEME)

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
