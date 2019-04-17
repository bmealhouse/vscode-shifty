const assert = require('assert')
const vscode = require('vscode')

const {
  hasShiftIntervalStarted,
  getShiftIntervalIds,
} = require('../src/shift-interval')

suite('shift-interval.test.js', () => {
  test('should NOT start the shift interval when VS Code starts up', () => {
    assert.ok(!hasShiftIntervalStarted())
  })

  test('should register shift interval commands when VS Code starts up', async () => {
    const commands = await vscode.commands.getCommands()
    assert.ok(commands.includes('shifty.enableShiftInterval'))
    assert.ok(commands.includes('shifty.disableShiftInterval'))
  })

  test('should start & stop the shift interval using commands', async () => {
    assert.ok(!hasShiftIntervalStarted())
    await vscode.commands.executeCommand('shifty.enableShiftInterval')
    assert.ok(hasShiftIntervalStarted())
    await vscode.commands.executeCommand('shifty.disableShiftInterval')
    assert.ok(!hasShiftIntervalStarted())
  })

  test('should restart the shift interval when the shift interval has been started and the config changes', async () => {
    await vscode.commands.executeCommand('shifty.enableShiftInterval')
    assert.ok(hasShiftIntervalStarted())

    const shiftIntervalIds = getShiftIntervalIds()

    const config = vscode.workspace.getConfiguration('shifty.shiftInterval')
    const originalValue = config.shiftColorThemeIntervalMs
    await config.update('shiftColorThemeIntervalMs', 1337, true)

    assert.ok(hasShiftIntervalStarted())
    assert.notDeepStrictEqual(getShiftIntervalIds(), shiftIntervalIds)

    await vscode.commands.executeCommand('shifty.disableShiftInterval')
    await config.update('shiftColorThemeIntervalMs', originalValue, true)
  })

  test('should do nothing when the shift interval has not been started and the config changes', async () => {
    assert.ok(!hasShiftIntervalStarted())

    const config = vscode.workspace.getConfiguration('shifty.shiftInterval')
    const originalValue = config.shiftColorThemeIntervalMs
    await config.update('shiftColorThemeIntervalMs', 1337, true)

    const {
      shiftColorThemeIntervalId,
      shiftFontFamilyIntervalId,
    } = getShiftIntervalIds()

    assert.ok(!hasShiftIntervalStarted())
    assert.strictEqual(shiftColorThemeIntervalId, null)
    assert.strictEqual(shiftFontFamilyIntervalId, null)

    await config.update('shiftColorThemeIntervalMs', originalValue, true)
  })
})
