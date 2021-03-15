import path from "path";
import Mocha from "mocha";
import glob from "glob";

export async function run(): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: "tdd",
    color: true,
  });

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
