import * as vscode from 'vscode'
import {updateConfig, formatSnapshot} from '../test/test-utils'
import commandMap from '../command-map'
import {
  DEFAULT_FONT_FAMILY,
  FontFamilyPlatform,
  FontFamilyType,
  getAllFontFamilies,
  getAvailableFontFamilies,
  getFontFamily,
  getRawFontFamiliesCache,
  setFontFamily,
} from '.'

const DEFAULT_PLATFORM = FontFamilyPlatform.MAC_OS

const osTypeMock = jest.fn()
jest.mock('os', () => ({
  type() {
    return osTypeMock()
  },
}))

beforeEach(() => {
  osTypeMock.mockImplementation(() => DEFAULT_PLATFORM)
})

test('includes the fallback font family when shifty sets "editor.fontFamily"', async () => {
  const {fontFamily} = vscode.workspace.getConfiguration('editor')
  expect(fontFamily).toBe(`"${DEFAULT_FONT_FAMILY.id}", monospace`)
})

test(`sets the font family with out a fallback`, async () => {
  await updateConfig('shifty.fontFamilies.fallbackFontFamily', null)
  await vscode.commands.executeCommand(commandMap.SHIFT_FONT_FAMILY)

  const {fontFamily} = vscode.workspace.getConfiguration('editor')
  expect(fontFamily.includes(', ')).toBeFalsy()
})

test('wraps font families with quotes when they include spaces', async () => {
  const fontFamilyWithWhitespace = getAllFontFamilies().find(ff =>
    /\s/.test(ff.id),
  )

  await setFontFamily(fontFamilyWithWhitespace!.id)

  const {fontFamily} = vscode.workspace.getConfiguration('editor')
  expect(fontFamily).toBe(`"${fontFamilyWithWhitespace!.id}", monospace`)
})

test('returns the current font family without quotes', async () => {
  const fontFamilyWithWhitespace = getAllFontFamilies().find(ff =>
    /\s/.test(ff.id),
  )

  await setFontFamily(fontFamilyWithWhitespace!.id)
  expect(getFontFamily()).toBe(fontFamilyWithWhitespace!.id)
})

test('registers font family commands when VS Code starts up', async () => {
  const commands = await vscode.commands.getCommands()
  expect(commands).toContain(commandMap.SHIFT_FONT_FAMILY)
  expect(commands).toContain(commandMap.TOGGLE_FAVORITE_FONT_FAMILY)
  expect(commands).toContain(commandMap.IGNORE_FONT_FAMILY)
})

// prettier-ignore
test(`shifts the font family when running the "${commandMap.SHIFT_FONT_FAMILY}" command`, async () => {
  const spy = jest.spyOn(vscode.commands, 'executeCommand')
  await vscode.commands.executeCommand(commandMap.SHIFT_FONT_FAMILY)

  expect(getFontFamily()).not.toBe(DEFAULT_FONT_FAMILY.id)

  const [,secondCall] = spy.mock.calls
  expect(secondCall).toEqual([commandMap.RESET_SHIFT_INTERVAL])
})

// prettier-ignore
test(`favorites the current font family when running the "${commandMap.TOGGLE_FAVORITE_FONT_FAMILY}" command`, async () => {
  const spy = jest.spyOn(vscode.window, 'showInformationMessage')
  await vscode.commands.executeCommand(commandMap.TOGGLE_FAVORITE_FONT_FAMILY)

  const {favoriteFontFamilies} = vscode.workspace.getConfiguration(
    'shifty.fontFamilies',
  )
  expect(favoriteFontFamilies).toContain(DEFAULT_FONT_FAMILY.id)

  const [firstCall] = spy.mock.calls
  expect(formatSnapshot(firstCall)).toMatchInlineSnapshot(
    `"['Added \\"Courier New\\" to favorites']"`,
  )

  spy.mockRestore()
})

// prettier-ignore
test(`unfavorites the current font family when running the "${commandMap.TOGGLE_FAVORITE_FONT_FAMILY}" command`, async () => {
  const favorites = [DEFAULT_FONT_FAMILY.id, 'SF Mono']
  await updateConfig('shifty.fontFamilies.favoriteFontFamilies', favorites)

  const spy = jest.spyOn(vscode.window, 'showInformationMessage')
  await vscode.commands.executeCommand(commandMap.TOGGLE_FAVORITE_FONT_FAMILY)

  const {
    favoriteFontFamilies,
  } = vscode.workspace.getConfiguration('shifty.fontFamilies')
  expect(favoriteFontFamilies).not.toContain(DEFAULT_FONT_FAMILY.id)

  const [firstCall] = spy.mock.calls
  expect(formatSnapshot(firstCall)).toMatchInlineSnapshot(
    `"['Removed \\"Courier New\\" from favorites']"`,
  )

  spy.mockRestore()
})

// prettier-ignore
test(`ignores the current font family and shift the font family when running the "${commandMap.IGNORE_FONT_FAMILY}" command`, async () => {
  const spy = jest.spyOn(vscode.window, 'showInformationMessage')
  await vscode.commands.executeCommand(commandMap.IGNORE_FONT_FAMILY)

  const {ignoreFontFamilies} = vscode.workspace.getConfiguration(
    'shifty.fontFamilies',
  )
  expect(ignoreFontFamilies).toContain(DEFAULT_FONT_FAMILY.id)

  const [firstCall] = spy.mock.calls
  expect(formatSnapshot(firstCall)).toMatchInlineSnapshot(
    `"['Ignored \\"Courier New\\"']"`,
  )

  expect(getFontFamily()).not.toBe(DEFAULT_FONT_FAMILY.id)

  spy.mockRestore()
})

// prettier-ignore
test(`ignores the current font family and remove the font family from favorites when running the "${commandMap.IGNORE_FONT_FAMILY}" command`, async () => {
  const favorites = [DEFAULT_FONT_FAMILY.id, 'SF Mono']
  await updateConfig('shifty.fontFamilies.favoriteFontFamilies', favorites)
  await vscode.commands.executeCommand(commandMap.IGNORE_FONT_FAMILY)

  const {
    favoriteFontFamilies,
    ignoreFontFamilies,
  } = vscode.workspace.getConfiguration('shifty.fontFamilies')

  expect(ignoreFontFamilies).toContain(DEFAULT_FONT_FAMILY.id)
  expect(favoriteFontFamilies).not.toContain(DEFAULT_FONT_FAMILY.id)
})

test('primes the font families cache after the "shifty.fontFamilies" config changes', async () => {
  const rawFontFamiliesCache = getRawFontFamiliesCache()
  await updateConfig('shifty.fontFamilies.ignoreCodefaceFontFamilies', true)
  expect(getRawFontFamiliesCache()).not.toEqual(rawFontFamiliesCache)
})

test('returns all font families when no font families are ignored', async () => {
  // change any shifty.fontFamilies config to prime the cache
  await updateConfig('shifty.fontFamilies.fallbackFontFamily', '')

  expect(getAvailableFontFamilies().length).toBe(
    getAllFontFamilies().filter(ff =>
      ff.supportedPlatforms.includes(DEFAULT_PLATFORM),
    ).length - 1,
  )
})

test('returns all font families except the current font family', () => {
  expect(getAvailableFontFamilies().map(ff => ff.id)).not.toContain(
    DEFAULT_FONT_FAMILY.id,
  )
})

test('returns all font families except the ignored font families', async () => {
  const sfMono = 'SF Mono'
  await updateConfig('shifty.fontFamilies.ignoreFontFamilies', [sfMono])
  expect(getAvailableFontFamilies().map(ff => ff.id)).not.toContain(sfMono)
})

test('returns no codeface font families when ignored', async () => {
  await updateConfig('shifty.fontFamilies.ignoreCodefaceFontFamilies', true)
  expect(
    getAvailableFontFamilies().every(ff => ff.type !== FontFamilyType.CODEFACE),
  ).toBeTruthy()
})

test('returns font families that are supported on linux', async () => {
  osTypeMock.mockImplementation(() => FontFamilyPlatform.LINUX)

  // change any shifty.fontFamilies config to prime the cache
  await updateConfig('shifty.fontFamilies.fallbackFontFamily', '')

  expect(
    getAvailableFontFamilies().every(ff =>
      ff.supportedPlatforms.includes(FontFamilyPlatform.LINUX),
    ),
  ).toBeTruthy()
})

test('returns font families that are supported on mac os', async () => {
  osTypeMock.mockImplementation(() => FontFamilyPlatform.MAC_OS)

  // change any shifty.fontFamilies config to prime the cache
  await updateConfig('shifty.fontFamilies.fallbackFontFamily', '')

  expect(
    getAvailableFontFamilies().every(ff =>
      ff.supportedPlatforms.includes(FontFamilyPlatform.MAC_OS),
    ),
  ).toBeTruthy()
})

test('returns font families that are supported on windows', async () => {
  osTypeMock.mockImplementation(() => FontFamilyPlatform.WINDOWS)

  // change any shifty.fontFamilies config to prime the cache
  await updateConfig('shifty.fontFamilies.fallbackFontFamily', '')

  expect(
    getAvailableFontFamilies().every(ff =>
      ff.supportedPlatforms.includes(FontFamilyPlatform.WINDOWS),
    ),
  ).toBeTruthy()
})

test('returns the default font family when dealing with an unsupported platform', async () => {
  osTypeMock.mockImplementation(() => 'Unsupported platform')

  // change any shifty.fontFamilies config to prime the cache
  await updateConfig('shifty.fontFamilies.fallbackFontFamily', '')

  expect(getRawFontFamiliesCache()).toEqual([DEFAULT_FONT_FAMILY])
})

test('returns user specified font families', async () => {
  const dankMono = 'Dank Mono'
  await updateConfig('shifty.fontFamilies.includeFontFamilies', [dankMono])
  expect(getAvailableFontFamilies().map(ff => ff.id)).toContain(dankMono)
})

test('returns favorite font familes when shiftMode is set to "favorites"', async () => {
  const favorites = ['Monaco', 'monofur', 'SF Mono']
  await updateConfig('shifty.fontFamilies.favoriteFontFamilies', favorites)
  await updateConfig('shifty.shiftMode', 'favorites')
  expect(getAvailableFontFamilies().map(ff => ff.id)).toEqual(favorites)
})

test('returns font families without favorites when shiftMode is set to "discovery"', async () => {
  const sfMono = 'SF Mono'
  await updateConfig('shifty.fontFamilies.favoriteFontFamilies', [sfMono])
  await updateConfig('shifty.shiftMode', 'discovery')
  expect(getAvailableFontFamilies().map(ff => ff.id)).not.toContain(sfMono)
})

test('returns favorite font families when shiftMode is set to "discovery" and all font families have been ignored or favorited', async () => {
  const favorites = ['Monaco', 'monofur', 'SF Mono']
  await updateConfig('shifty.fontFamilies.favoriteFontFamilies', favorites)
  await updateConfig('shifty.shiftMode', 'discovery')

  // ignore the rest of the available font families
  await updateConfig('shifty.fontFamilies.ignoreFontFamilies', [
    // FIXME: having to replace quotes in tests is really hacky
    ...getAvailableFontFamilies().map(ff => ff.id.replace(/"/g, '')),
    DEFAULT_FONT_FAMILY.id,
  ])

  expect(getAvailableFontFamilies().map(ff => ff.id)).toEqual(favorites)
})

test('returns the default font family when shiftMode is set to "discovery" and all font families have been ignored', async () => {
  await updateConfig('shifty.shiftMode', 'discovery')

  // ignore all font families
  await updateConfig('shifty.fontFamilies.ignoreFontFamilies', [
    // FIXME: having to replace quotes in tests is really hacky
    ...getAvailableFontFamilies().map(ff => ff.id.replace(/"/g, '')),
    DEFAULT_FONT_FAMILY.id,
  ])

  expect(getRawFontFamiliesCache()).toEqual([DEFAULT_FONT_FAMILY])
})
