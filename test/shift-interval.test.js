const assert = require('assert')
const vscode = require('vscode')
const {getColorTheme, DEFAULT_COLOR_THEME} = require('../src/color-themes')
const {getFontFamily, DEFAULT_FONT_FAMILY} = require('../src/font-families')
const {
  _getShiftIntervalIds,
  hasShiftIntervalStarted,
  getRemainingTimeForShiftIntervals,
} = require('../src/shift-interval')
const {setupTest, teardownTest, setConfig, wait} = require('./test-utils')

suite('shift-interval.test.js', () => {
  setup(async () => {
    await setupTest()
  })

  teardown(async () => {
    await teardownTest()
  })

  test('should not start the shift interval when VS Code starts up', () => {
    assert.ok(!hasShiftIntervalStarted())
  })

  test('should register shift interval commands when VS Code starts up', async () => {
    const commands = await vscode.commands.getCommands()
    assert.ok(commands.includes('shifty.startShiftInterval'))
    assert.ok(commands.includes('shifty.stopShiftInterval'))
  })

  test('should start and stop the shift interval using commands', async () => {
    assert.ok(!hasShiftIntervalStarted())
    await vscode.commands.executeCommand('shifty.startShiftInterval')
    assert.ok(hasShiftIntervalStarted())
    await vscode.commands.executeCommand('shifty.stopShiftInterval')
    assert.ok(!hasShiftIntervalStarted())
  })

  test('should not start shift intervals when set to 0ms', async () => {
    await setConfig('shifty.shiftInterval.shiftColorThemeIntervalMs', 0)
    await setConfig('shifty.shiftInterval.shiftFontFamilyIntervalMs', 0)
    await vscode.commands.executeCommand('shifty.startShiftInterval')

    const {
      shiftColorThemeIntervalId,
      shiftFontFamilyIntervalId,
    } = _getShiftIntervalIds()

    assert.ok(!hasShiftIntervalStarted())
    assert.strictEqual(shiftColorThemeIntervalId, null)
    assert.strictEqual(shiftFontFamilyIntervalId, null)
  })

  test('should not start shift intervals when set to null', async () => {
    await setConfig('shifty.shiftInterval.shiftColorThemeIntervalMs', null)
    await setConfig('shifty.shiftInterval.shiftFontFamilyIntervalMs', null)
    await vscode.commands.executeCommand('shifty.startShiftInterval')

    const {
      shiftColorThemeIntervalId,
      shiftFontFamilyIntervalId,
    } = _getShiftIntervalIds()

    assert.ok(!hasShiftIntervalStarted())
    assert.strictEqual(shiftColorThemeIntervalId, null)
    assert.strictEqual(shiftFontFamilyIntervalId, null)
  })

  test('should restart the shift interval when the shift interval has been started and the config changes', async () => {
    await vscode.commands.executeCommand('shifty.startShiftInterval')
    assert.ok(hasShiftIntervalStarted())

    const shiftIntervalIds = _getShiftIntervalIds()
    await setConfig('shifty.shiftInterval.shiftColorThemeIntervalMs', 1337)
    assert.ok(hasShiftIntervalStarted())
    assert.notDeepStrictEqual(_getShiftIntervalIds(), shiftIntervalIds)

    await vscode.commands.executeCommand('shifty.stopShiftInterval')
  })

  test('should do nothing when the shift interval has not been started and the config changes', async () => {
    assert.ok(!hasShiftIntervalStarted())

    await setConfig('shifty.shiftInterval.shiftFontFamilyIntervalMs', 1337)

    const {
      shiftColorThemeIntervalId,
      shiftFontFamilyIntervalId,
    } = _getShiftIntervalIds()

    assert.ok(!hasShiftIntervalStarted())
    assert.strictEqual(shiftColorThemeIntervalId, null)
    assert.strictEqual(shiftFontFamilyIntervalId, null)
  })

  test('should shift the color theme when the shift interval has completed', async () => {
    await vscode.commands.executeCommand('shifty.startShiftInterval')
    assert.ok(hasShiftIntervalStarted())

    await setConfig('shifty.colorThemes.ignoreColorThemes', [
      DEFAULT_COLOR_THEME,
    ])
    await setConfig('shifty.shiftInterval.shiftColorThemeIntervalMs', 25)
    await wait(100) // need to wait at least 100ms for this test to work
    await vscode.commands.executeCommand('shifty.stopShiftInterval')

    assert.notStrictEqual(getColorTheme(), DEFAULT_COLOR_THEME)
  })

  test('should shift the color theme when the shift interval has completed', async () => {
    await vscode.commands.executeCommand('shifty.startShiftInterval')
    assert.ok(hasShiftIntervalStarted())

    await setConfig('shifty.fontFamilies.ignoreFontFamilies', [
      DEFAULT_FONT_FAMILY,
    ])
    await setConfig('shifty.shiftInterval.shiftFontFamilyIntervalMs', 25)
    await wait(100) // need to wait at least 100ms for this test to work
    await vscode.commands.executeCommand('shifty.stopShiftInterval')

    assert.notStrictEqual(getFontFamily(), DEFAULT_FONT_FAMILY)
  })

  test('should return nulls for remaining time when the shift interval has not been started', () => {
    assert.ok(!hasShiftIntervalStarted())

    const {
      shiftColorThemeRemainingTime,
      shiftFontFamilyRemainingTime,
    } = getRemainingTimeForShiftIntervals()

    assert.strictEqual(shiftColorThemeRemainingTime, null)
    assert.strictEqual(shiftFontFamilyRemainingTime, null)
  })

  test('should return remaining time when the shift interval has been started', async () => {
    await vscode.commands.executeCommand('shifty.startShiftInterval')
    assert.ok(hasShiftIntervalStarted())

    const {
      shiftColorThemeRemainingTime,
      shiftFontFamilyRemainingTime,
    } = getRemainingTimeForShiftIntervals()
    assert.ok(shiftColorThemeRemainingTime.match(/^\d{2}:\d{2}$/))
    assert.ok(shiftFontFamilyRemainingTime.match(/^\d{2}:\d{2}$/))

    await vscode.commands.executeCommand('shifty.stopShiftInterval')
  })
})
