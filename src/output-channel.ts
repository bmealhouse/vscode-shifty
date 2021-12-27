import vscode from "vscode";

const channel = vscode.window.createOutputChannel("shifty");

export function log(message: string) {
  channel.appendLine(message);
}
