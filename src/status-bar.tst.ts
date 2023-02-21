// import expect from "expect";
// import sinon from "sinon";
// import vscode from "vscode";

// import { commandMap, defaultColorTheme, defaultFontFamily } from "./constants";
// import { updateConfig } from "./test/utils";

// suite("status-bar.test.ts", () => {
//   test("registers status bar commands at vscode start up", async () => {
//     // arrange
//     // act
//     const commands = await vscode.commands.getCommands();

//     // assert
//     expect(commands).toContain(commandMap.showStatus);
//   });

//   test('displays the current color theme when running the "SHOW_STATUS" command', async () => {
//     // arrange
//     const spy = sinon.spy(vscode.window, "showInformationMessage");

//     // act
//     await vscode.commands.executeCommand(commandMap.showStatus);

//     // assert
//     expect(spy.secondCall.args).toEqual([
//       'Using "Default Dark+" color theme',
//       "Favorite",
//       "Ignore",
//       "Shift",
//     ]);
//   });

//   test('displays the unfavorite button when running the "SHOW_STATUS" command and the current color theme has already been favorited', async () => {
//     // arrange
//     const favorites = ["Abyss", defaultColorTheme];
//     await updateConfig("shifty.colorThemes.favoriteColorThemes", favorites);
//     const spy = sinon.spy(vscode.window, "showInformationMessage");

//     // act
//     await vscode.commands.executeCommand(commandMap.showStatus);

//     // assert
//     expect(spy.secondCall.args).toEqual([
//       'Using "Default Dark+" color theme',
//       "Unfavorite",
//       "Ignore",
//       "Shift",
//     ]);
//   });

//   test('displays the current font family when running the "SHOW_STATUS" command', async () => {
//     // arrange
//     const spy = sinon.spy(vscode.window, "showInformationMessage");

//     // act
//     await vscode.commands.executeCommand(commandMap.showStatus);

//     // assert
//     expect(spy.firstCall.args).toEqual([
//       'Using "Courier New" font family',
//       "Favorite",
//       "Ignore",
//       "Shift",
//     ]);
//   });

//   test('displays the unfavorite button when running the "SHOW_STATUS" command and the current font family has already been favorited', async () => {
//     // arrange
//     const favorites = [defaultFontFamily, "Menlo"];
//     await updateConfig("shifty.fontFamilies.favoriteFontFamilies", favorites);
//     const spy = sinon.spy(vscode.window, "showInformationMessage");

//     // act
//     await vscode.commands.executeCommand(commandMap.showStatus);

//     // assert
//     expect(spy.firstCall.args).toEqual([
//       'Using "Courier New" font family',
//       "Unfavorite",
//       "Ignore",
//       "Shift",
//     ]);
//   });
// });
