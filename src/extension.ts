if (process.env.NODE_ENV === "test") {
  void import("./test/mock-vscode-config");
}

import vscode from "vscode";

import { commandMap } from "./constants";
import {
  activateShiftInterval,
  deactivateShiftInterval,
} from "./shift-interval";
import { activateFontFamilies, shiftFontFamily } from "./font-families";
import { activateColorThemes, shiftColorTheme } from "./color-themes";
import { activateStatusBar } from "./status-bar";

export function activate(context: vscode.ExtensionContext): void {
  activateStatusBar(context);
  void activateShiftInterval(context);
  activateColorThemes(context);
  activateFontFamilies(context);

  context.subscriptions.push(
    vscode.commands.registerCommand(commandMap.SHIFT, async () => {
      await Promise.all([shiftFontFamily(), shiftColorTheme()]);
      await vscode.commands.executeCommand(commandMap.RESET_SHIFT_INTERVAL);
    }),
    vscode.commands.registerCommand(commandMap.ENABLE_DEBUGGING, () => {
      process.env.SHIFTY_DEBUG = "true";
    })
  );
}

export async function deactivate(): Promise<void> {
  await deactivateShiftInterval();
}
