import vscode from "vscode";

const channel = vscode.window.createOutputChannel("shifty");

export function log(message: any) {
  if (typeof message === "string") {
    channel.appendLine(message);
  } else {
    channel.appendLine(JSON.stringify(message, undefined, 2));
  }
}
