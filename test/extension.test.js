const assert = require('assert')
const vscode = require('vscode')
const {getColorTheme, DEFAULT_COLOR_THEME} = require('../src/color-themes')
const {getFontFamily, DEFAULT_FONT_FAMILY} = require('../src/font-families')
const {setupTest, teardownTest, getConfig} = require('./test-utils')

suite('extension.test.js', () => {
  setup(async () => {
    await setupTest()
  })

  teardown(async () => {
    await teardownTest()
  })

  test('should register global commands when VS Code starts up', async () => {
    const commands = await vscode.commands.getCommands()
    assert.ok(commands.includes('shifty.shiftBoth'))
  })

  test('should shift the color theme and font family when running the "shifty.shiftBoth" command', async () => {
    await vscode.commands.executeCommand('shifty.shiftBoth')
    assert.notStrictEqual(getColorTheme(), DEFAULT_COLOR_THEME)
    assert.notStrictEqual(getFontFamily(), DEFAULT_FONT_FAMILY)
  })

  test('should favorite the color theme and font family when running the "shifty.favoriteBoth" command', async () => {
    await vscode.commands.executeCommand('shifty.favoriteBoth')
    assert.ok(
      getConfig('shifty.colorThemes.favoriteColorThemes').includes(
        DEFAULT_COLOR_THEME,
      ),
    )
    assert.ok(
      vscode.window.showInformationMessage.firstCall.lastArg ===
        `Added "${DEFAULT_COLOR_THEME}" to favorites`,
    )
    assert.ok(
      getConfig('shifty.fontFamilies.favoriteFontFamilies').includes(
        DEFAULT_FONT_FAMILY,
      ),
    )
    assert.ok(
      vscode.window.showInformationMessage.secondCall.lastArg ===
        `Added "${DEFAULT_FONT_FAMILY}" to favorites`,
    )
  })

  test('should ignore the color theme and font family when running the "shifty.ignoreBoth" command', async () => {
    await vscode.commands.executeCommand('shifty.ignoreBoth')
    assert.ok(
      getConfig('shifty.colorThemes.ignoreColorThemes').includes(
        DEFAULT_COLOR_THEME,
      ),
    )
    assert.ok(
      getConfig('shifty.fontFamilies.ignoreFontFamilies').includes(
        DEFAULT_FONT_FAMILY,
      ),
    )
  })
})
