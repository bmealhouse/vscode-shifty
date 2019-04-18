const assert = require('assert')
const vscode = require('vscode')
const {getCurrentColorTheme, setColorTheme} = require('../src/color-themes')
const {getCurrentFontFamily, setFontFamily} = require('../src/font-families')

let originalColorTheme = null
let originalFontFamily = null
const DEFAULT_COLOR_THEME = 'Visual Studio Dark'
const DEFUALT_FONT_FAMILY = 'Monaco'

setup(async () => {
  originalColorTheme = getCurrentColorTheme()
  await setColorTheme(DEFAULT_COLOR_THEME)

  originalFontFamily = getCurrentFontFamily()
  setFontFamily(DEFUALT_FONT_FAMILY)
})

teardown(async () => {
  if (originalColorTheme) {
    await setColorTheme(originalColorTheme)
  }

  if (originalColorTheme) {
    await setFontFamily(originalFontFamily)
  }
})

suite('extension.test.js', () => {
  test('should register global commands when VS Code starts up', async () => {
    const commands = await vscode.commands.getCommands()
    assert.ok(commands.includes('shifty.shiftAll'))
  })

  test('should shift the color theme and font family when running the "shifty.shiftAll" command', async () => {
    await vscode.commands.executeCommand('shifty.shiftAll')
    assert.notStrictEqual(getCurrentColorTheme(), DEFAULT_COLOR_THEME)
    assert.notStrictEqual(getCurrentFontFamily(), DEFUALT_FONT_FAMILY)
  })
})
