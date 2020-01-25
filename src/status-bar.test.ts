import * as vscode from 'vscode'
import {formatSnapshot, updateConfig} from './test-utils'
import commandMap from './command-map'
import {DEFAULT_COLOR_THEME} from './color-themes'
import {DEFAULT_FONT_FAMILY} from './font-families'

test('registers status bar commands when VS Code starts up', async () => {
  const commands = await vscode.commands.getCommands()
  expect(commands).toContain(commandMap.SHOW_STATUS)
})

test(`displays the current color theme when running the "commandMap.SHOW_STATUS" command`, async () => {
  const spy = jest.spyOn(vscode.window, 'showInformationMessage')
  await vscode.commands.executeCommand(commandMap.SHOW_STATUS)

  const [, secondCall] = spy.mock.calls
  expect(formatSnapshot(secondCall)).toMatchInlineSnapshot(
    `"['Using \\"Default Dark+\\" color theme','Favorite','Ignore','Shift']"`,
  )

  spy.mockRestore()
})

test(`displays the unfavorite button when running the "commandMap.SHOW_STATUS" command and the current color theme has already been favorited`, async () => {
  const favorites = ['Abyss', DEFAULT_COLOR_THEME.id]
  await updateConfig('shifty.colorThemes.favoriteColorThemes', favorites)

  const spy = jest.spyOn(vscode.window, 'showInformationMessage')
  await vscode.commands.executeCommand(commandMap.SHOW_STATUS)

  const [, secondCall] = spy.mock.calls
  expect(formatSnapshot(secondCall)).toMatchInlineSnapshot(
    `"['Using \\"Default Dark+\\" color theme','Unfavorite','Ignore','Shift']"`,
  )

  spy.mockRestore()
})

test(`displays the current font family when running the "commandMap.SHOW_STATUS" command`, async () => {
  const spy = jest.spyOn(vscode.window, 'showInformationMessage')
  await vscode.commands.executeCommand(commandMap.SHOW_STATUS)

  const [firstCall] = spy.mock.calls
  expect(formatSnapshot(firstCall)).toMatchInlineSnapshot(
    `"['Using \\"Courier New\\" font family','Favorite','Ignore','Shift']"`,
  )

  spy.mockRestore()
})

test(`displays the unfavorite button when running the "commandMap.SHOW_STATUS" command and the current font family has already been favorited`, async () => {
  const favorites = [DEFAULT_FONT_FAMILY.id, 'SF Mono']
  await updateConfig('shifty.fontFamilies.favoriteFontFamilies', favorites)

  const spy = jest.spyOn(vscode.window, 'showInformationMessage')
  await vscode.commands.executeCommand(commandMap.SHOW_STATUS)

  const [firstCall] = spy.mock.calls
  expect(formatSnapshot(firstCall)).toMatchInlineSnapshot(
    `"['Using \\"Courier New\\" font family','Unfavorite','Ignore','Shift']"`,
  )

  spy.mockRestore()
})
