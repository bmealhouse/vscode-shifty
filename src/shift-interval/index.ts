import * as vscode from 'vscode'
import commandMap from '../command-map'
import * as ipcClient from './ipc-client'
import {ClientConnection, ServerConnection} from './ipc-types'

let connection: ClientConnection | ServerConnection

export async function activateShiftInterval(
  context: vscode.ExtensionContext,
): Promise<void> {
  context.subscriptions.push(
    vscode.commands.registerCommand(commandMap.START_SHIFT_INTERVAL, () => {
      connection.startShiftInterval()
    }),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand(commandMap.PAUSE_SHIFT_INTERVAL, () => {
      connection.pauseShiftInterval()
    }),
  )

  // 1. Attempt to connect as client.
  connection = await ipcClient.connect()
}

export async function deactivateShiftInterval(): Promise<void> {
  await connection.close()
}

export function setConnection(
  nextConnection: ClientConnection | ServerConnection,
): void {
  connection = nextConnection
}
