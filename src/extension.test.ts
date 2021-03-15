import expect from "expect";
import vscode from "vscode";

import { commandMap } from "./constants";

suite("extension.test.ts", () => {
  test("registers global commands at vscode start up", async () => {
    const commands = await vscode.commands.getCommands();
    expect(commands).toContain(commandMap.SHIFT);
    expect(commands).toContain(commandMap.ENABLE_DEBUGGING);
  });

  // test('shifts the color theme and font when running the "SHIFT" command', async () => {
  //   const spy = spyOn(vscode.commands, "executeCommand");
  //   await vscode.commands.executeCommand(commandMap.SHIFT);

  //   expect(getColorTheme()).not.toBe(DEFAULT_COLOR_THEME.id);
  //   expect(getFontFamily()).not.toBe(DEFAULT_FONT_FAMILY.id);

  //   const [, secondCall] = spy.mock.calls;
  //   expect(secondCall).toEqual([commandMap.RESET_SHIFT_INTERVAL]);

  //   spy.mockRestore();
  // });
});
