import * as vscode from 'vscode'
import {formatSnapshot} from './test/test-utils'

test('registers status bar commands when VS Code starts up', async () => {
  const commands = await vscode.commands.getCommands()
  expect(commands).toContain('shifty.showStatus')
})

test('displays the current color theme when running the "shifty.showStatus" command', async () => {
  const spy = jest.spyOn(vscode.window, 'showInformationMessage')
  await vscode.commands.executeCommand('shifty.showStatus')

  const [, secondCall] = spy.mock.calls
  expect(formatSnapshot(secondCall)).toMatchInlineSnapshot(
    `"['Using \\"Default Dark+\\" color theme','Favorite','Ignore','Shift']"`,
  )

  spy.mockRestore()
})

test('displays the current font family when running the "shifty.showStatus" command', async () => {
  const spy = jest.spyOn(vscode.window, 'showInformationMessage')
  await vscode.commands.executeCommand('shifty.showStatus')

  const [firstCall] = spy.mock.calls
  expect(formatSnapshot(firstCall)).toMatchInlineSnapshot(
    `"['Using \\"Courier New\\" font family','Favorite','Ignore','Shift']"`,
  )

  spy.mockRestore()
})
