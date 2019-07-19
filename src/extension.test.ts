import * as vscode from 'vscode'
import {getColorTheme, DEFAULT_COLOR_THEME} from './color-themes'
import {getFontFamily, DEFAULT_FONT_FAMILY} from './font-families'
import {formatSnapshot} from './test/test-utils'

test('registers global commands when VS Code starts up', async () => {
  const commands = await vscode.commands.getCommands()
  expect(commands).toContain('shifty.shiftBoth')
})

test('shifts the color theme and font family when running the "shifty.shiftBoth" command', async () => {
  await vscode.commands.executeCommand('shifty.shiftBoth')
  expect(getColorTheme()).not.toBe(DEFAULT_COLOR_THEME.id)
  expect(getFontFamily()).not.toBe(DEFAULT_FONT_FAMILY.id)
})

test('favorites the color theme and font family when running the "shifty.favoriteBoth" command', async () => {
  const spy = jest.spyOn(vscode.window, 'showInformationMessage')
  await vscode.commands.executeCommand('shifty.favoriteBoth')

  const {
    colorThemes: {favoriteColorThemes},
    fontFamilies: {favoriteFontFamilies},
  } = vscode.workspace.getConfiguration('shifty')

  expect(favoriteFontFamilies).toContain(DEFAULT_FONT_FAMILY.id)
  expect(favoriteColorThemes).toContain(DEFAULT_COLOR_THEME.id)

  const [firstCall] = spy.mock.calls
  expect(formatSnapshot(firstCall)).toMatchInlineSnapshot(
    `"['Added \\"Default Dark+\\" and \\"Courier New\\" to favorites']"`,
  )

  spy.mockRestore()
})

test('ignores the color theme and font family when running the "shifty.ignoreBoth" command', async () => {
  const spy = jest.spyOn(vscode.window, 'showInformationMessage')
  await vscode.commands.executeCommand('shifty.ignoreBoth')

  const {
    colorThemes: {ignoreColorThemes},
    fontFamilies: {ignoreFontFamilies},
  } = vscode.workspace.getConfiguration('shifty')

  expect(ignoreFontFamilies).toContain(DEFAULT_FONT_FAMILY.id)
  expect(ignoreColorThemes).toContain(DEFAULT_COLOR_THEME.id)

  const [firstCall] = spy.mock.calls
  expect(formatSnapshot(firstCall)).toMatchInlineSnapshot(
    `"['Ignored \\"Default Dark+\\" and \\"Courier New\\"']"`,
  )

  spy.mockRestore()
})
