const assert = require('assert')
const vscode = require('vscode')
const {
  maybeShiftColorThemeOnStartup,
  getColorThemes,
  getCurrentColorTheme,
  DARK_COLOR_THEME,
  LIGHT_COLOR_THEME,
  HIGH_CONTRAST_COLOR_THEME,
  DEFAULT_COLOR_THEME,
  __getColorThemesCache,
} = require('../src/color-themes')
const {setupTest, teardownTest, getConfig, setConfig} = require('./test-utils')

suite('color-themes.test.js', () => {
  setup(async () => {
    await setupTest()
  })

  teardown(async () => {
    await teardownTest()
  })

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
    assert.ok(commands.includes('shifty.favoriteCurrentColorTheme'))
    assert.ok(commands.includes('shifty.ignoreCurrentColorTheme'))
  })

  test('should shift the color theme when running the "shifty.shiftColorTheme" command', async () => {
    await vscode.commands.executeCommand('shifty.shiftColorTheme')
    assert.notStrictEqual(getCurrentColorTheme(), DEFAULT_COLOR_THEME)
  })

  test('should favorite the current color theme when running the "shifty.favoriteCurrentColorTheme" command', async () => {
    await vscode.commands.executeCommand('shifty.favoriteCurrentColorTheme')
    assert.ok(
      getConfig('shifty.colorThemes.favoriteColorThemes').includes(
        DEFAULT_COLOR_THEME,
      ),
    )
    assert.strictEqual(
      vscode.window.showInformationMessage.firstCall.lastArg,
      `Added "${DEFAULT_COLOR_THEME}" to favorites`,
    )
  })

  test('should ignore the current color theme and shift the color theme when running the "shifty.ignoreCurrentColorTheme" command', async () => {
    await vscode.commands.executeCommand('shifty.ignoreCurrentColorTheme')
    assert.ok(
      getConfig('shifty.colorThemes.ignoreColorThemes').includes(
        DEFAULT_COLOR_THEME,
      ),
    )
    assert.notStrictEqual(getCurrentColorTheme(), DEFAULT_COLOR_THEME)
  })

  test('should ignore the current color theme and remove the color theme from favorites when running the "shifty.ignoreCurrentColorTheme" command', async () => {
    const favorites = ['Abyss', DEFAULT_COLOR_THEME]
    await setConfig('shifty.colorThemes.favoriteColorThemes', favorites)
    assert.deepStrictEqual(
      getConfig('shifty.colorThemes.favoriteColorThemes'),
      favorites,
    )

    await vscode.commands.executeCommand('shifty.ignoreCurrentColorTheme')
    const ignoreColorThemes = getConfig('shifty.colorThemes.ignoreColorThemes')
    assert.ok(ignoreColorThemes.includes(DEFAULT_COLOR_THEME))

    const favoriteColorThemes = getConfig(
      'shifty.colorThemes.favoriteColorThemes',
    )
    assert.ok(!favoriteColorThemes.includes(DEFAULT_COLOR_THEME))
    assert.strictEqual(favoriteColorThemes.length, favorites.length - 1)
  })

  test('should prime the color themes cache after the "shifty.colorThemes" config changes', async () => {
    const originalColorThemesCache = __getColorThemesCache()
    await setConfig('shifty.colorThemes.ignoreLightColorThemes', true)
    assert.notDeepStrictEqual(__getColorThemesCache(), originalColorThemesCache)
  })

  test('should return all color themes when no color themes are ignored', () => {
    const TOTAL_DEFAULT_VSCODE_THEMES = 14
    assert.strictEqual(getColorThemes().length, TOTAL_DEFAULT_VSCODE_THEMES - 1)
  })

  test('should return all color themes except the current color theme', () => {
    assert.ok(!getColorThemes().find(ct => ct.id === DEFAULT_COLOR_THEME))
  })

  test('should return all color themes except the ignored color themes', async () => {
    const abyss = 'Abyss'
    await setConfig('shifty.colorThemes.ignoreColorThemes', [abyss])
    assert.ok(!getColorThemes().find(ct => ct.id === abyss))
  })

  test('should return no dark color themes when ignored', async () => {
    await setConfig('shifty.colorThemes.ignoreDarkColorThemes', true)
    assert.ok(getColorThemes().every(ct => ct.uiTheme !== DARK_COLOR_THEME))
  })

  test('should return no light color themes when ignored', async () => {
    await setConfig('shifty.colorThemes.ignoreLightColorThemes', true)
    assert.ok(getColorThemes().every(ct => ct.uiTheme !== LIGHT_COLOR_THEME))
  })

  test('should return no high contrast color themes when ignored', async () => {
    await setConfig('shifty.colorThemes.ignoreHighContrastColorThemes', true)
    assert.ok(
      getColorThemes().every(ct => ct.uiTheme !== HIGH_CONTRAST_COLOR_THEME),
    )
  })

  test('should return the default color theme when all color theme types are ignored', async () => {
    await setConfig('shifty.colorThemes.ignoreDarkColorThemes', true)
    await setConfig('shifty.colorThemes.ignoreLightColorThemes', true)
    await setConfig('shifty.colorThemes.ignoreHighContrastColorThemes', true)
    assert.deepStrictEqual(getColorThemes(), [DEFAULT_COLOR_THEME])
  })

  test('should return favorite color themes when shiftMode is set to "favorites"', async () => {
    const favorites = ['Abyss', 'Monokai Dimmed', 'Solarized Dark']
    await setConfig('shifty.colorThemes.favoriteColorThemes', favorites)
    await setConfig('shifty.shiftMode', 'favorites')
    assert.deepStrictEqual(getColorThemes(), favorites)
  })

  test('should return color themes without favorites when shiftMode is set to "discovery"', async () => {
    const abyss = 'Abyss'
    await setConfig('shifty.colorThemes.favoriteColorThemes', [abyss])
    await setConfig('shifty.shiftMode', 'discovery')
    assert.ok(!getColorThemes().find(ct => ct.id === abyss))
  })

  test('should return favorite color themes when shiftMode is set to "discovery" and all color themes have been ignored or favorited', async () => {
    const favorites = ['Abyss', 'Monokai Dimmed', 'Solarized Dark']
    await setConfig('shifty.colorThemes.favoriteColorThemes', favorites)
    await setConfig('shifty.shiftMode', 'discovery')

    // ignore the rest of the available color themes
    await setConfig('shifty.colorThemes.ignoreColorThemes', [
      ...getColorThemes().map(ct => ct.id),
      DEFAULT_COLOR_THEME,
    ])

    assert.deepStrictEqual(getColorThemes(), favorites)
  })

  test('should return the default VS Code color theme when shiftMode is set to "discovery" and all color themes have been ignored', async () => {
    await setConfig('shifty.shiftMode', 'discovery')

    // ignore all color themes
    await setConfig('shifty.colorThemes.ignoreColorThemes', [
      ...getColorThemes().map(ct => ct.id),
      DEFAULT_COLOR_THEME,
    ])

    assert.deepStrictEqual(getColorThemes(), [DEFAULT_COLOR_THEME])
  })
})
