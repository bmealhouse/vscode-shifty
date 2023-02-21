import path from "node:path";
import glob from "glob";
import Mocha from "mocha";
import sinon from "sinon";

import { resetVscodeConfig } from "./mock-vscode-config";

export async function run(): Promise<void> {
  const mocha = new Mocha({
    ui: "tdd",
    color: true,
    retries: 1,
    rootHooks: {
      beforeEach() {
        resetVscodeConfig();
      },
      afterEach() {
        // eslint-disable-next-line import/no-named-as-default-member
        sinon.restore();
      },
    },
  });

  // eslint-disable-next-line unicorn/prefer-module
  const testsRoot = path.resolve(__dirname, "..");

  return new Promise((resolve, reject) => {
    glob("**/**.test.js", { cwd: testsRoot }, (error, files) => {
      if (error) {
        reject(error);
        return;
      }

      // Add files to the test suite
      for (const file of files) {
        mocha.addFile(path.resolve(testsRoot, file));
      }

      try {
        // Run the mocha test
        mocha.run((failures: number) => {
          if (failures > 0) {
            reject(new Error(`${failures} tests failed.`));
          } else {
            resolve();
          }
        });
      } catch (error: unknown) {
        console.error(error);
        reject(error);
      }
    });
  });
}
