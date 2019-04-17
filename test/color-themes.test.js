const assert = require('assert')
const vscode = require('vscode')
const {
  maybeShiftColorThemeOnStartup,
  getColorThemes,
  getCurrentColorTheme,
  setColorTheme,
  DARK_COLOR_THEME,
  LIGHT_COLOR_THEME,
  HIGH_CONTRAST_COLOR_THEME,
  __getColorThemesCache,
} = require('../src/color-themes')
const setConfig = require('./utils/set-config')

let originalConfig = null
let originalColorTheme = null
const DEFAULT_COLOR_THEME = 'Visual Studio Dark'

setup(async () => {
  originalColorTheme = getCurrentColorTheme()
  await setColorTheme(DEFAULT_COLOR_THEME)

  originalConfig = vscode.workspace.getConfiguration('shifty')
  await setConfig('shifty.colorThemes.ignoreColorThemes', [])
  await setConfig('shifty.colorThemes.ignoreDarkColorThemes', false)
  await setConfig('shifty.colorThemes.ignoreHighContrastColorThemes', false)
  await setConfig('shifty.colorThemes.ignoreLightColorThemes', false)
  await setConfig('shifty.startup.shiftColorThemeOnStartup', false)
})

teardown(async () => {
  if (originalColorTheme) {
    await setColorTheme(originalColorTheme)
  }

  // restore originalConfig
  if (originalConfig) {
    await setConfig(
      'shifty.colorThemes.ignoreColorThemes',
      originalConfig.colorThemes.ignoreColorThemes,
    )
    await setConfig(
      'shifty.colorThemes.ignoreDarkColorThemes',
      originalConfig.colorThemes.ignoreDarkColorThemes,
    )
    await setConfig(
      'shifty.colorThemes.ignoreLightColorThemes',
      originalConfig.colorThemes.ignoreLightColorThemes,
    )
    await setConfig(
      'shifty.colorThemes.ignoreHighContrastColorThemes',
      originalConfig.colorThemes.ignoreHighContrastColorThemes,
    )
    await setConfig(
      'shifty.startup.shiftColorThemeOnStartup',
      originalConfig.startup.shiftColorThemeOnStartup,
    )
  }
})

suite('color-themes.test.js', () => {
  test('should not shift the color theme when VS Code starts up if "shifty.startup.shiftColorThemeOnStartup" is disabled', async () => {
    await maybeShiftColorThemeOnStartup()
    assert.strictEqual(getCurrentColorTheme(), DEFAULT_COLOR_THEME)
  })

  test('should shift the color theme when VS Code starts up if "shifty.startup.shiftColorThemeOnStartup" is enabled', async () => {
    await setConfig('shifty.startup.shiftColorThemeOnStartup', true)
    await maybeShiftColorThemeOnStartup()
    assert.notStrictEqual(getCurrentColorTheme(), DEFAULT_COLOR_THEME)
  })

  test('should register color theme commands when VS Code starts up', async () => {
    const commands = await vscode.commands.getCommands()
    assert.ok(commands.includes('shifty.shiftColorTheme'))
    assert.ok(commands.includes('shifty.ignoreCurrentColorTheme'))
  })

  test('should shift the color theme when running the "shifty.shiftColorTheme" command', async () => {
    await vscode.commands.executeCommand('shifty.shiftColorTheme')
    assert.notStrictEqual(getCurrentColorTheme(), DEFAULT_COLOR_THEME)
  })

  test('should ignore the current color theme and shift the color theme when running the "shifty.ignoreCurrentColorTheme" command', async () => {
    await vscode.commands.executeCommand('shifty.ignoreCurrentColorTheme')
    const config = vscode.workspace.getConfiguration('shifty.colorThemes')
    assert.ok(config.ignoreColorThemes.includes(DEFAULT_COLOR_THEME))
    assert.notStrictEqual(getCurrentColorTheme(), DEFAULT_COLOR_THEME)
  })

  test('should prime the color themes cache after the "shifty.colorThemes" config changes', async () => {
    const originalColorThemesCache = __getColorThemesCache()
    await setConfig('shifty.colorThemes.ignoreLightColorThemes', true)
    assert.notDeepStrictEqual(__getColorThemesCache(), originalColorThemesCache)
  })

  test('should return all color themes when no color themes are ignored', () => {
    const colorThemes = getColorThemes()
    const TOTAL_DEFAULT_VSCODE_THEMES = 14
    assert.strictEqual(colorThemes.length, TOTAL_DEFAULT_VSCODE_THEMES - 1)
  })

  test('should return all color themes except the current color theme', () => {
    const colorThemes = getColorThemes()
    assert.ok(colorThemes.every(ct => ct.id !== DEFAULT_COLOR_THEME))
  })

  test('should return all color themes except the ignored color themes', async () => {
    const abyss = 'Abyss'
    await setConfig('shifty.colorThemes.ignoreColorThemes', [abyss])
    const colorThemes = getColorThemes()
    assert.ok(colorThemes.every(ct => ct.id !== abyss))
  })

  test('should return no dark color themes when ignored', async () => {
    await setConfig('shifty.colorThemes.ignoreDarkColorThemes', true)
    const colorThemes = getColorThemes()
    assert.ok(colorThemes.every(ct => ct.uiTheme !== DARK_COLOR_THEME))
  })

  test('should return no light color themes when ignored', async () => {
    await setConfig('shifty.colorThemes.ignoreLightColorThemes', true)
    const colorThemes = getColorThemes()
    assert.ok(colorThemes.every(ct => ct.uiTheme !== LIGHT_COLOR_THEME))
  })

  test('should return no high contrast color themes when ignored', async () => {
    await setConfig('shifty.colorThemes.ignoreHighContrastColorThemes', true)
    const colorThemes = getColorThemes()
    assert.ok(colorThemes.every(ct => ct.uiTheme !== HIGH_CONTRAST_COLOR_THEME))
  })

  test('should return no color themes when all color theme types are ignored', async () => {
    await setConfig('shifty.colorThemes.ignoreDarkColorThemes', true)
    await setConfig('shifty.colorThemes.ignoreLightColorThemes', true)
    await setConfig('shifty.colorThemes.ignoreHighContrastColorThemes', true)

    const colorThemes = getColorThemes()
    assert.strictEqual(colorThemes.length, 0)
  })
})
