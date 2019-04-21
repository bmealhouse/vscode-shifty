const assert = require('assert')
const vscode = require('vscode')
const {
  maybeShiftFontFamilyOnStartup,
  getFontFamilies,
  getCurrentFontFamily,
  allFontFamilies,
  __getFontFamiliesCache,
} = require('../src/font-families')
const {
  CODEFACE,
  MAC_OS,
  WINDOWS,
} = require('../src/font-families/font-family-types')
const {
  setupTest,
  teardownTest,
  setConfig,
  DEFAULT_FONT_FAMILY,
} = require('./test-utils')

suite('font-families.test.js', () => {
  setup(async () => {
    await setupTest()
  })

  teardown(async () => {
    await teardownTest()
  })

  test('should not shift the font family when VS Code starts up if "shifty.startup.shiftFontFamilyOnStartup" is disabled', async () => {
    await maybeShiftFontFamilyOnStartup()
    assert.strictEqual(getCurrentFontFamily(), DEFAULT_FONT_FAMILY)
  })

  test('should shift the font family when VS Code starts up if "shifty.startup.shiftFontFamilyOnStartup" is enabled', async () => {
    await setConfig('shifty.startup.shiftFontFamilyOnStartup', true)
    await maybeShiftFontFamilyOnStartup()
    assert.notStrictEqual(getCurrentFontFamily(), DEFAULT_FONT_FAMILY)
  })

  test('should register font family commands when VS Code starts up', async () => {
    const commands = await vscode.commands.getCommands()
    assert.ok(commands.includes('shifty.shiftFontFamily'))
    assert.ok(commands.includes('shifty.ignoreCurrentFontFamily'))
  })

  test('should shift the font family when running the "shifty.shiftFontFamily" command', async () => {
    await vscode.commands.executeCommand('shifty.shiftFontFamily')
    assert.notStrictEqual(getCurrentFontFamily(), DEFAULT_FONT_FAMILY)
  })

  test('should ignore the current font family and shift the font family when running the "shifty.ignoreCurrentFontFamily" command', async () => {
    await vscode.commands.executeCommand('shifty.ignoreCurrentFontFamily')
    const config = vscode.workspace.getConfiguration('shifty.fontFamilies')
    assert.ok(config.ignoreFontFamilies.includes(DEFAULT_FONT_FAMILY))
    assert.notStrictEqual(getCurrentFontFamily(), DEFAULT_FONT_FAMILY)
  })

  test('should prime the font families cache after the "shifty.fontFamilies" config changes', async () => {
    const originalFontFamiliesCache = __getFontFamiliesCache()
    await setConfig('shifty.fontFamilies.ignoreWindowsFontFamilies', true)
    assert.notDeepStrictEqual(
      __getFontFamiliesCache(),
      originalFontFamiliesCache,
    )
  })

  test('should return all font families when no font families are ignored', () => {
    const fontFamilies = getFontFamilies()
    assert.strictEqual(fontFamilies.length, allFontFamilies.length - 1)
  })

  test('should return all font families except the current font family', () => {
    const fontFamilies = getFontFamilies()
    assert.ok(fontFamilies.every(ff => ff.id !== DEFAULT_FONT_FAMILY))
  })

  test('should return all font families except the ignored font families', async () => {
    const sfMono = 'SF Mono'
    await setConfig('shifty.fontFamilies.ignoreFontFamilies', [sfMono])
    const fontFamilies = getFontFamilies()
    assert.ok(fontFamilies.every(ff => ff.id !== sfMono))
  })

  test('should return no codeface font families when ignored', async () => {
    await setConfig('shifty.fontFamilies.ignoreCodefaceFontFamilies', true)
    const fontFamilies = getFontFamilies()
    assert.ok(fontFamilies.every(ff => ff.type !== CODEFACE))
  })

  test('should return no mac os font families when ignored', async () => {
    await setConfig('shifty.fontFamilies.ignoreMacosFontFamilies', true)
    const fontFamilies = getFontFamilies()
    assert.ok(fontFamilies.every(ff => !ff.type !== MAC_OS))
  })

  test('should return no windows font families when ignored', async () => {
    await setConfig('shifty.fontFamilies.ignoreWindowsFontFamilies', true)
    const fontFamilies = getFontFamilies()
    assert.ok(fontFamilies.every(ff => !ff.type !== WINDOWS))
  })

  test('should return no font families when all font families types are ignored', async () => {
    await setConfig('shifty.fontFamilies.ignoreCodefaceFontFamilies', true)
    await setConfig('shifty.fontFamilies.ignoreMacosFontFamilies', true)
    await setConfig('shifty.fontFamilies.ignoreWindowsFontFamilies', true)

    const fontFamilies = getFontFamilies()
    assert.strictEqual(fontFamilies.length, 0)
  })

  test('should return user specified font families', async () => {
    const dankMono = 'Dank Mono'
    await setConfig('shifty.fontFamilies.includeFontFamilies', [dankMono])
    const fontFamilies = getFontFamilies()
    assert.ok(fontFamilies.find(ff => ff.id === dankMono))
  })
})
