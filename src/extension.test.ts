import expect from "expect";
import sinon from "sinon";
import vscode from "vscode";

import { commandMap, DEFAULT_COLOR_THEME } from "./constants";
import { getColorTheme } from "./color-themes";

suite("extension.test.ts", () => {
  test("registers global commands at vscode start up", async () => {
    // arrange
    // act
    const commands = await vscode.commands.getCommands();

    // assert
    expect(commands).toContain(commandMap.SHIFT);
    expect(commands).toContain(commandMap.ENABLE_DEBUGGING);
  });

  test('shifts the color theme and font when running the "SHIFT" command', async () => {
    // arrange
    const spy = sinon.spy(vscode.commands, "executeCommand");

    // act
    await vscode.commands.executeCommand(commandMap.SHIFT);

    // assert
    expect(getColorTheme()).not.toBe(DEFAULT_COLOR_THEME);
    // expect(getFontFamily()).not.toBe(DEFAULT_FONT_FAMILY.id);
    expect(spy.secondCall.firstArg).toBe(commandMap.RESET_SHIFT_INTERVAL);

    spy.restore();
  });
});
