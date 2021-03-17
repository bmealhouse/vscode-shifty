import vscode from "vscode";
import { commandMap } from "../constants";
// import * as ipcClient from './ipc-client'
// import {ClientConnection, ServerConnection} from './ipc-types'

// let connection: ClientConnection | ServerConnection

export async function activateShiftInterval(
  context: vscode.ExtensionContext
): Promise<void> {
  context.subscriptions.push(
    vscode.commands.registerCommand(commandMap.START_SHIFT_INTERVAL, () => {
      // connection.startShiftInterval();
    }),
    vscode.commands.registerCommand(commandMap.PAUSE_SHIFT_INTERVAL, () => {
      // connection.pauseShiftInterval();
    }),
    vscode.commands.registerCommand(commandMap.RESET_SHIFT_INTERVAL, () => {
      // connection.resetShiftInterval();
    })
  );

  // 1. Attempt to connect as client.
  // connection = await ipcClient.connect();
}

// export async function deactivateShiftInterval(): Promise<void> {
//   await connection.close()
// }

// export function setConnection(
//   nextConnection: ClientConnection | ServerConnection,
// ): void {
//   connection = nextConnection
// }
