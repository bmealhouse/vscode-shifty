import path from "node:path";
import process from "node:process";
import { runTests } from "@vscode/test-electron";

// eslint-disable-next-line unicorn/prefer-top-level-await
void main();

async function main() {
  try {
    // The folder containing the Extension Manifest package.json
    // Passed to `--extensionDevelopmentPath`
    // eslint-disable-next-line unicorn/prefer-module
    const extensionDevelopmentPath = path.resolve(__dirname, "../../");
    // const foo = new URL('foo.js', import.meta.url);

    // The path to test runner
    // Passed to --extensionTestsPath
    // eslint-disable-next-line unicorn/prefer-module
    const extensionTestsPath = path.resolve(__dirname, "./suite");

    // Download VS Code, unzip it and run the integration test
    await runTests({ extensionDevelopmentPath, extensionTestsPath });
  } catch {
    console.error("Failed to run tests");
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  }
}
