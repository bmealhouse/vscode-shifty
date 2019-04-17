const assert = require('assert')
const vscode = require('vscode')
const {
  hasShiftIntervalStarted,
  __getShiftIntervalIds,
} = require('../src/shift-interval')
const setConfig = require('./utils/set-config')

let originalConfig = null

setup(async () => {
  originalConfig = vscode.workspace.getConfiguration('shifty')
  await setConfig('shifty.shiftInterval.shiftColorThemeIntervalMs', 1800000)
  await setConfig('shifty.shiftInterval.shiftFontFamilyIntervalMs', 1800000)
})

teardown(async () => {
  // restore originalConfig
  if (originalConfig) {
    await setConfig(
      'shifty.shiftInterval.shiftColorThemeIntervalMs',
      originalConfig.shiftInterval.shiftColorThemeIntervalMs,
    )
    await setConfig(
      'shifty.shiftInterval.shiftFontFamilyIntervalMs',
      originalConfig.shiftInterval.shiftFontFamilyIntervalMs,
    )
  }
})

suite('shift-interval.test.js', () => {
  test('should not start the shift interval when VS Code starts up', () => {
    assert.ok(!hasShiftIntervalStarted())
  })

  test('should register shift interval commands when VS Code starts up', async () => {
    const commands = await vscode.commands.getCommands()
    assert.ok(commands.includes('shifty.enableShiftInterval'))
    assert.ok(commands.includes('shifty.disableShiftInterval'))
  })

  test('should start and stop the shift interval using commands', async () => {
    assert.ok(!hasShiftIntervalStarted())
    await vscode.commands.executeCommand('shifty.enableShiftInterval')
    assert.ok(hasShiftIntervalStarted())
    await vscode.commands.executeCommand('shifty.disableShiftInterval')
    assert.ok(!hasShiftIntervalStarted())
  })

  test('should restart the shift interval when the shift interval has been started and the config changes', async () => {
    await vscode.commands.executeCommand('shifty.enableShiftInterval')
    assert.ok(hasShiftIntervalStarted())

    const shiftIntervalIds = __getShiftIntervalIds()
    await setConfig('shifty.shiftInterval.shiftColorThemeIntervalMs', 1337)
    assert.ok(hasShiftIntervalStarted())
    assert.notDeepStrictEqual(__getShiftIntervalIds(), shiftIntervalIds)

    await vscode.commands.executeCommand('shifty.disableShiftInterval')
  })

  test('should do nothing when the shift interval has not been started and the config changes', async () => {
    assert.ok(!hasShiftIntervalStarted())

    await setConfig('shifty.shiftInterval.shiftFontFamilyIntervalMs', 1337)

    const {
      shiftColorThemeIntervalId,
      shiftFontFamilyIntervalId,
    } = __getShiftIntervalIds()

    assert.ok(!hasShiftIntervalStarted())
    assert.strictEqual(shiftColorThemeIntervalId, null)
    assert.strictEqual(shiftFontFamilyIntervalId, null)
  })
})
