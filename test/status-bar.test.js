const assert = require('assert')
const vscode = require('vscode')
const {DEFAULT_COLOR_THEME} = require('../src/color-themes')
const {DEFAULT_FONT_FAMILY} = require('../src/font-families')
const {setupTest, teardownTest, setConfig} = require('./test-utils')

suite('status-bar.test.js', () => {
  setup(async () => {
    await setupTest()
  })

  teardown(async () => {
    await teardownTest()
  })

  test('should register status bar commands when VS Code starts up', async () => {
    const commands = await vscode.commands.getCommands()
    assert.ok(commands.includes('shifty.showStatus'))
  })

  test('should display the current color theme and font family when running the "shifty.showStatus" command', async () => {
    await vscode.commands.executeCommand('shifty.showStatus')
    assert.deepStrictEqual(
      vscode.window.showInformationMessage.secondCall.args,
      [
        `Using "${DEFAULT_COLOR_THEME}" with "${DEFAULT_FONT_FAMILY}" font family`,
        'Favorite color theme',
        'Favorite font family',
        'Favorite both',
      ],
    )
  })

  test('should display the stopped shift interval status when running the "shifty.showStatus" command', async () => {
    await vscode.commands.executeCommand('shifty.showStatus')
    assert.deepStrictEqual(
      vscode.window.showInformationMessage.firstCall.args,
      ['Shift interval has not been started', 'Start shift interval'],
    )
  })

  test('should display the color theme shift interval status when running the "shifty.showStatus" command', async () => {
    await setConfig('shifty.shiftInterval.shiftColorThemeIntervalMs', 1337)
    await setConfig('shifty.shiftInterval.shiftFontFamilyIntervalMs', 0)
    await vscode.commands.executeCommand('shifty.startShiftInterval')

    await vscode.commands.executeCommand('shifty.showStatus')
    assert.ok(
      vscode.window.showInformationMessage.firstCall.lastArg.match(
        /^\d{2}:\d{2} until color theme will shift$/,
      ),
    )

    await vscode.commands.executeCommand('shifty.stopShiftInterval')
  })

  test('should display the font family shift interval status when running the "shifty.showStatus" command', async () => {
    await setConfig('shifty.shiftInterval.shiftColorThemeIntervalMs', 0)
    await setConfig('shifty.shiftInterval.shiftFontFamilyIntervalMs', 1337)
    await vscode.commands.executeCommand('shifty.startShiftInterval')

    await vscode.commands.executeCommand('shifty.showStatus')
    assert.ok(
      vscode.window.showInformationMessage.firstCall.lastArg.match(
        /^\d{2}:\d{2} until font family will shift$/,
      ),
    )

    await vscode.commands.executeCommand('shifty.stopShiftInterval')
  })

  test('should display the color theme and font family shift interval status when running the "shifty.showStatus" command', async () => {
    await setConfig('shifty.shiftInterval.shiftColorThemeIntervalMs', 1337)
    await setConfig('shifty.shiftInterval.shiftFontFamilyIntervalMs', 1337)
    await vscode.commands.executeCommand('shifty.startShiftInterval')

    await vscode.commands.executeCommand('shifty.showStatus')
    assert.ok(
      vscode.window.showInformationMessage.firstCall.lastArg.match(
        /^\d{2}:\d{2} until color theme & font family will shift$/,
      ),
    )

    await vscode.commands.executeCommand('shifty.stopShiftInterval')
  })

  test('should display separate color theme and font family shift interval status when running the "shifty.showStatus" command', async () => {
    await setConfig('shifty.shiftInterval.shiftColorThemeIntervalMs', 1337)
    await setConfig('shifty.shiftInterval.shiftFontFamilyIntervalMs', 7331)
    await vscode.commands.executeCommand('shifty.startShiftInterval')

    await vscode.commands.executeCommand('shifty.showStatus')
    assert.ok(
      vscode.window.showInformationMessage.firstCall.lastArg.match(
        /^\d{2}:\d{2} until color theme will shift$/,
      ),
    )
    assert.ok(
      vscode.window.showInformationMessage.secondCall.lastArg.match(
        /^\d{2}:\d{2} until font family will shift$/,
      ),
    )

    await vscode.commands.executeCommand('shifty.stopShiftInterval')
  })
})
