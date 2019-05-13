const os = require('os')
const assert = require('assert')
const vscode = require('vscode')
const {
  _getFontFamiliesCache,
  shiftFontFamilyOnStartup,
  getFontFamily,
  setFontFamily,
  allFontFamilies,
  getAvailableFontFamilies,
  DEFAULT_FONT_FAMILY,
} = require('../src/font-families')
const {
  CODEFACE,
  LINUX,
  MAC_OS,
  WINDOWS,
} = require('../src/font-families/font-family-types')
const {
  setupTest,
  teardownTest,
  getConfig,
  setConfig,
  DEFAULT_PLATFORM,
} = require('./test-utils')

suite('font-families.test.js', () => {
  setup(async () => {
    await setupTest()
  })

  teardown(async () => {
    await teardownTest()
  })

  test('should include the fallback font family', async () => {
    assert.strictEqual(
      getConfig('editor.fontFamily'),
      `"${DEFAULT_FONT_FAMILY}", monospace`,
    )
  })

  test(`should set the font family with out a fallback`, async () => {
    await setConfig('shifty.fontFamilies.fallbackFontFamily', null)
    await vscode.commands.executeCommand('shifty.shiftFontFamily')
    assert.ok(!getConfig('editor.fontFamily').includes(', '))
  })

  test('should wrap font families with quotes when they include spaces', async () => {
    const {id: fontFamilyWithSpace} = allFontFamilies.find(ff =>
      /\s/.test(ff.id),
    )
    await setFontFamily(fontFamilyWithSpace)
    assert.strictEqual(
      getConfig('editor.fontFamily'),
      `"${fontFamilyWithSpace}", monospace`,
    )
  })

  test('should return the current font family without quotes', async () => {
    const {id: fontFamilyWithSpace} = allFontFamilies.find(ff =>
      /\s/.test(ff.id),
    )
    await setFontFamily(fontFamilyWithSpace)
    assert.strictEqual(getFontFamily(), fontFamilyWithSpace)
  })

  test('should not shift the font family when VS Code starts up if "shifty.startup.shiftFontFamilyOnStartup" is disabled', async () => {
    await shiftFontFamilyOnStartup()
    assert.strictEqual(getFontFamily(), DEFAULT_FONT_FAMILY)
  })

  test('should shift the font family when VS Code starts up if "shifty.startup.shiftFontFamilyOnStartup" is enabled', async () => {
    await setConfig('shifty.startup.shiftFontFamilyOnStartup', true)
    await shiftFontFamilyOnStartup()
    assert.notStrictEqual(getFontFamily(), DEFAULT_FONT_FAMILY)
  })

  test('should register font family commands when VS Code starts up', async () => {
    const commands = await vscode.commands.getCommands()
    assert.ok(commands.includes('shifty.shiftFontFamily'))
    assert.ok(commands.includes('shifty.favoriteFontFamily'))
    assert.ok(commands.includes('shifty.ignoreFontFamily'))
  })

  test('should shift the font family when running the "shifty.shiftFontFamily" command', async () => {
    await vscode.commands.executeCommand('shifty.shiftFontFamily')
    assert.notStrictEqual(getFontFamily(), DEFAULT_FONT_FAMILY)
  })

  test('should favorite the current font family when running the "shifty.favoriteFontFamily" command', async () => {
    await vscode.commands.executeCommand('shifty.favoriteFontFamily')
    assert.ok(
      getConfig('shifty.fontFamilies.favoriteFontFamilies').includes(
        DEFAULT_FONT_FAMILY,
      ),
    )
    assert.strictEqual(
      vscode.window.showInformationMessage.firstCall.lastArg,
      `Added "${DEFAULT_FONT_FAMILY}" to favorites`,
    )
  })

  test('should ignore the current font family and shift the font family when running the "shifty.ignoreFontFamily" command', async () => {
    await vscode.commands.executeCommand('shifty.ignoreFontFamily')
    assert.ok(
      getConfig('shifty.fontFamilies.ignoreFontFamilies').includes(
        DEFAULT_FONT_FAMILY,
      ),
    )
    assert.strictEqual(
      vscode.window.showInformationMessage.firstCall.lastArg,
      `Ignored "${DEFAULT_FONT_FAMILY}"`,
    )
    assert.notStrictEqual(getFontFamily(), DEFAULT_FONT_FAMILY)
  })

  test('should ignore the current font family and remove the font family from favorites when running the "shifty.ignoreFontFamily" command', async () => {
    const favorites = [DEFAULT_FONT_FAMILY, 'SF Mono']
    await setConfig('shifty.fontFamilies.favoriteFontFamilies', favorites)
    assert.deepStrictEqual(
      getConfig('shifty.fontFamilies.favoriteFontFamilies'),
      favorites,
    )

    await vscode.commands.executeCommand('shifty.ignoreFontFamily')
    assert.ok(
      getConfig('shifty.fontFamilies.ignoreFontFamilies').includes(
        DEFAULT_FONT_FAMILY,
      ),
    )

    const favoriteFontFamilies = getConfig(
      'shifty.fontFamilies.favoriteFontFamilies',
    )
    assert.ok(!favoriteFontFamilies.includes(DEFAULT_FONT_FAMILY))
    assert.strictEqual(favoriteFontFamilies.length, favorites.length - 1)
  })

  test('should prime the font families cache after the "shifty.fontFamilies" config changes', async () => {
    const originalFontFamiliesCache = _getFontFamiliesCache()
    await setConfig('shifty.fontFamilies.ignoreCodefaceFontFamilies', true)
    assert.notDeepStrictEqual(
      _getFontFamiliesCache(),
      originalFontFamiliesCache,
    )
  })

  test('should return all font families when no font families are ignored', () => {
    assert.strictEqual(
      getAvailableFontFamilies().length,
      allFontFamilies.filter(ff =>
        ff.supportedPlatforms.includes(DEFAULT_PLATFORM),
      ).length - 1,
    )
  })

  test('should return all font families except the current font family', () => {
    assert.ok(
      getAvailableFontFamilies().every(ff => ff.id !== DEFAULT_FONT_FAMILY),
    )
  })

  test('should return all font families except the ignored font families', async () => {
    const sfMono = 'SF Mono'
    await setConfig('shifty.fontFamilies.ignoreFontFamilies', [sfMono])
    assert.ok(getAvailableFontFamilies().every(ff => ff.id !== sfMono))
  })

  test('should return no codeface font families when ignored', async () => {
    await setConfig('shifty.fontFamilies.ignoreCodefaceFontFamilies', true)
    assert.ok(getAvailableFontFamilies().every(ff => ff.type !== CODEFACE))
  })

  test('should return font families that are supported on linux', async () => {
    os.type.returns(LINUX)

    // change any shifty.fontFamilies config to reprime the cache
    await setConfig('shifty.fontFamilies.fallbackFontFamily', '')

    assert.ok(
      getAvailableFontFamilies().every(ff =>
        ff.supportedPlatforms.includes(LINUX),
      ),
    )
  })

  test('should return font families that are supported on mac os', async () => {
    os.type.returns(MAC_OS)

    // change any shifty.fontFamilies config to reprime the cache
    await setConfig('shifty.fontFamilies.fallbackFontFamily', '')

    assert.ok(
      getAvailableFontFamilies().every(ff =>
        ff.supportedPlatforms.includes(MAC_OS),
      ),
    )
  })

  test('should return font families that are supported on windows', async () => {
    os.type.returns(WINDOWS)

    // change any shifty.fontFamilies config to reprime the cache
    await setConfig('shifty.fontFamilies.fallbackFontFamily', '')

    assert.ok(
      getAvailableFontFamilies().every(ff =>
        ff.supportedPlatforms.includes(WINDOWS),
      ),
    )
  })

  test('should return the default font family when dealing with an unsupported platform', async () => {
    os.type.returns('Unsupported platform')

    // change any shifty.fontFamilies config to reprime the cache
    await setConfig('shifty.fontFamilies.fallbackFontFamily', '')

    assert.deepStrictEqual(getAvailableFontFamilies(), [DEFAULT_FONT_FAMILY])
  })

  test('should return user specified font families', async () => {
    const dankMono = 'Dank Mono'
    await setConfig('shifty.fontFamilies.includeFontFamilies', [dankMono])
    assert.ok(getAvailableFontFamilies().find(ff => ff.id === dankMono))
  })

  test('should return favorite font familes when shiftMode is set to "favorites"', async () => {
    const favorites = ['Monaco', 'monofur', 'SF Mono']
    await setConfig('shifty.fontFamilies.favoriteFontFamilies', favorites)
    await setConfig('shifty.shiftMode', 'favorites')
    assert.deepStrictEqual(getAvailableFontFamilies(), favorites)
  })

  test('should return font families without favorites when shiftMode is set to "discovery"', async () => {
    const sfMono = 'SF Mono'
    await setConfig('shifty.fontFamilies.favoriteFontFamilies', [sfMono])
    await setConfig('shifty.shiftMode', 'discovery')
    assert.ok(!getAvailableFontFamilies().find(ff => ff.id === sfMono))
  })

  test('should return favorite font families when shiftMode is set to "discovery" and all font families have been ignored or favorited', async () => {
    const favorites = ['Monaco', 'monofur', 'SF Mono']
    await setConfig('shifty.fontFamilies.favoriteFontFamilies', favorites)
    await setConfig('shifty.shiftMode', 'discovery')

    // ignore the rest of the available font families
    await setConfig('shifty.fontFamilies.ignoreFontFamilies', [
      ...getAvailableFontFamilies().map(ff => ff.id),
      DEFAULT_FONT_FAMILY,
    ])

    assert.deepStrictEqual(getAvailableFontFamilies(), favorites)
  })

  test('should return the default font family when shiftMode is set to "discovery" and all font families have been ignored', async () => {
    await setConfig('shifty.shiftMode', 'discovery')

    // ignore all font families
    await setConfig('shifty.fontFamilies.ignoreFontFamilies', [
      ...getAvailableFontFamilies().map(ff => ff.id),
      DEFAULT_FONT_FAMILY,
    ])

    assert.deepStrictEqual(getAvailableFontFamilies(), [DEFAULT_FONT_FAMILY])
  })
})
