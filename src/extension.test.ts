import * as vscode from 'vscode'
import {getColorTheme, DEFAULT_COLOR_THEME} from './color-themes'
import {getFontFamily, DEFAULT_FONT_FAMILY} from './font-families'
import commandMap from './command-map'

test('registers global commands when VS Code starts up', async () => {
  const commands = await vscode.commands.getCommands()
  expect(commands).toContain(commandMap.SHIFT)
  expect(commands).toContain(commandMap.ENABLE_DEBUGGING)
})

// prettier-ignore
test(`shifts the color theme and font family when running the "${commandMap.SHIFT}" command`, async () => {
  const spy = jest.spyOn(vscode.commands, 'executeCommand')
  await vscode.commands.executeCommand(commandMap.SHIFT)

  expect(getColorTheme()).not.toBe(DEFAULT_COLOR_THEME.id)
  expect(getFontFamily()).not.toBe(DEFAULT_FONT_FAMILY.id)

  const [,secondCall] = spy.mock.calls
  expect(secondCall).toEqual([commandMap.RESET_SHIFT_INTERVAL])

  spy.mockRestore()
})
