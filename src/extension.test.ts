import assert from "node:assert";
import vscode from "vscode";
import { getColorTheme } from "./color-themes";
import { commandMap, defaultColorTheme, defaultFontFamily } from "./constants";
import { getFontFamily } from "./font-families";
import { setupTest } from "./test/setup-test";

suite("extension.test.ts", () => {
  test("registers global commands at vscode start up", async () => {
    // arrange

    // act
    const commands = await vscode.commands.getCommands();

    // assert
    assert(commands.includes(commandMap.shift));
  });

  // TODO: break out into separate suite
  test.skip('shifts the color theme and font when running the "shift" command', async () => {
    // arrange
    const { executeCommandSpy } = setupTest();

    // act
    await vscode.commands.executeCommand(commandMap.shift);

    // assert
    assert.notStrictEqual(getColorTheme(), defaultColorTheme);
    assert.notStrictEqual(getFontFamily(), defaultFontFamily);
    assert(executeCommandSpy.calledWith(commandMap.restartShiftInterval));
  });
});
