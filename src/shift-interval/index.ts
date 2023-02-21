import vscode from "vscode";

import { commandMap } from "../constants";
import { ClientConnection, ServerConnection } from "./ipc-types";
// import * as ipcClient from "./ipc-client";

let connection: ClientConnection | ServerConnection;

export async function activateShiftInterval(
  context: vscode.ExtensionContext,
): Promise<void> {
  // void setInitialContext();

  context.subscriptions.push(
    // vscode.commands.registerCommand(commandMap.START_SHIFT_INTERVAL, () => {
    //   void connection.startShiftInterval();
    // }),
    // vscode.commands.registerCommand(commandMap.PAUSE_SHIFT_INTERVAL, () => {
    //   void connection.pauseShiftInterval();
    // }),
    vscode.commands.registerCommand(commandMap.restartShiftInterval, () => {
      // void connection.restartShiftInterval();
    }),
  );

  // 1 // Attempt to connect to existing server as client
  // connection = await ipcClient.connect();
}

export async function deactivateShiftInterval(): Promise<void> {
  await connection.close();
}

export function setConnection(
  nextConnection: ClientConnection | ServerConnection,
): void {
  connection = nextConnection;
}

export async function setInitialContext() {
  return vscode.commands.executeCommand(
    "setContext",
    "shifty.isShiftIntervalRunning",
    false,
  );
}
