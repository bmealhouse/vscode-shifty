const assert = require('assert')
const vscode = require('vscode')
const {
  getCurrentColorTheme,
  DEFAULT_COLOR_THEME,
} = require('../src/color-themes')
const {
  getCurrentFontFamily,
  DEFAULT_FONT_FAMILY,
} = require('../src/font-families')
const {setupTest, teardownTest} = require('./test-utils')

suite('extension.test.js', () => {
  setup(async () => {
    await setupTest()
  })

  teardown(async () => {
    await teardownTest()
  })

  test('should register global commands when VS Code starts up', async () => {
    const commands = await vscode.commands.getCommands()
    assert.ok(commands.includes('shifty.shiftAll'))
  })

  test('should shift the color theme and font family when running the "shifty.shiftAll" command', async () => {
    await vscode.commands.executeCommand('shifty.shiftAll')
    assert.notStrictEqual(getCurrentColorTheme(), DEFAULT_COLOR_THEME)
    assert.notStrictEqual(getCurrentFontFamily(), DEFAULT_FONT_FAMILY)
  })
})
