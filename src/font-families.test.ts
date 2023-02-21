// import expect from "expect";
// import sinon from "sinon";
// import vscode from "vscode";

// import { commandMap, defaultFontFamily } from "./constants";
// import {
//   getFontFamily,
//   getRawCache,
//   setFontFamily,
//   setContextForIsFavoriteFontFamily,
// } from "./font-families";
// import { updateConfig } from "./test/utils";

suite("font-families.test.ts", () => {
  //   test('includes the fallback font family when shifty sets "editor.fontFamily"', async () => {
  //     // arrange
  //     const menlo = "Menlo";
  //     // act
  //     await setFontFamily(menlo);
  //     // assert
  //     const { fontFamily } = vscode.workspace.getConfiguration("editor");
  //     expect(fontFamily).toBe(`${menlo}, monospace`);
  //   });
  //   test("sets the font family with out a fallback", async () => {
  //     // arrage
  //     await updateConfig("shifty.fontFamilies.fallbackFontFamily", null);
  //     // act
  //     await vscode.commands.executeCommand(commandMap.shiftFontFamily);
  //     // assert
  //     const { fontFamily } = vscode.workspace.getConfiguration("editor");
  //     expect(fontFamily.includes(", ")).toBeFalsy();
  //   });
  //   test("wraps font families with quotes when they include spaces", async () => {
  //     // arrange
  //     const fontFamilyWithWhitespace = getRawCache().find((fontFamily) =>
  //       /\s/.test(fontFamily),
  //     );
  //     if (fontFamilyWithWhitespace) {
  //       // act
  //       await setFontFamily(fontFamilyWithWhitespace);
  //       // assert
  //       const { fontFamily } = vscode.workspace.getConfiguration("editor");
  //       expect(fontFamily).toBe(`"${fontFamilyWithWhitespace}", monospace`);
  //     }
  //   });
  //   test("returns the current font family without quotes", async () => {
  //     // arrange
  //     const fontFamilyWithWhitespace = getRawCache().find((fontFamily) =>
  //       /\s/.test(fontFamily),
  //     );
  //     if (fontFamilyWithWhitespace) {
  //       // act
  //       await setFontFamily(fontFamilyWithWhitespace);
  //       // assert
  //       expect(getFontFamily()).toBe(fontFamilyWithWhitespace);
  //     }
  //   });
  //   test('sets initial context for "shifty.isFavoriteFontFamily" to false when the current font family is not favorited', async () => {
  //     // arrange
  //     const spy = sinon.spy(vscode.commands, "executeCommand");
  //     // act
  //     await setContextForIsFavoriteFontFamily();
  //     // assert
  //     expect(spy.firstCall.args).toStrictEqual([
  //       "setContext",
  //       "shifty.isFavoriteFontFamily",
  //       false,
  //     ]);
  //   });
  //   test('sets initial context for "shifty.isFavoriteFontFamily" to true when the current font family has been favorited', async () => {
  //     // arrange
  //     await updateConfig("shifty.fontFamilies.favoriteFontFamilies", [
  //       defaultFontFamily,
  //     ]);
  //     const spy = sinon.spy(vscode.commands, "executeCommand");
  //     // act
  //     await setContextForIsFavoriteFontFamily();
  //     // assert
  //     expect(spy.firstCall.args).toStrictEqual([
  //       "setContext",
  //       "shifty.isFavoriteFontFamily",
  //       true,
  //     ]);
  //   });

  test("registers font family commands at vscode start up", async () => {
    // arrange
    // act
    const commands = await vscode.commands.getCommands();
    // assert
    expect(commands).toContain(commandMap.shiftFontFamily);
    expect(commands).toContain(commandMap.favoriteFontFamily);
    expect(commands).toContain(commandMap.unfavoriteFontFamily);
    expect(commands).toContain(commandMap.ignoreFontFamily);
  });

  //   test('shifts the font family when running the "SHIFT_FONT_FAMILY" command', async () => {
  //     // arrange
  //     const spy = sinon.spy(vscode.commands, "executeCommand");
  //     // act
  //     await vscode.commands.executeCommand(commandMap.shiftFontFamily);
  //     // assert
  //     expect(getFontFamily()).not.toBe(defaultFontFamily);
  //     expect(spy.lastCall.firstArg).toBe(commandMap.restartShiftInterval);
  //   });
  //   test('favorites the current font family when running the "FAVORITE_FONT_FAMILY" command', async () => {
  //     // arrange
  //     const spy = sinon.spy(vscode.window, "showInformationMessage");
  //     // act
  //     await vscode.commands.executeCommand(commandMap.favoriteFontFamily);
  //     // assert
  //     const { favoriteFontFamilies } = vscode.workspace.getConfiguration(
  //       "shifty.fontFamilies",
  //     );
  //     expect(favoriteFontFamilies).toContain(defaultFontFamily);
  //     expect(spy.firstCall.firstArg).toBe('Added "Courier New" to favorites');
  //   });
  //   test('unfavorites the current font family when running the "UNFAVORITE_FONT_FAMILY" command', async () => {
  //     // arrange
  //     const favorites = [defaultFontFamily, "Menlo"];
  //     await updateConfig("shifty.fontFamilies.favoriteFontFamilies", favorites);
  //     const spy = sinon.spy(vscode.window, "showInformationMessage");
  //     // act
  //     await vscode.commands.executeCommand(commandMap.unfavoriteFontFamily);
  //     // assert
  //     const { favoriteFontFamilies } = vscode.workspace.getConfiguration(
  //       "shifty.fontFamilies",
  //     );
  //     expect(favoriteFontFamilies).not.toContain(defaultFontFamily);
  //     expect(spy.firstCall.firstArg).toBe('Removed "Courier New" from favorites');
  //   });
  //   test('ignores the current font family, shifts the font family, and resets the shift interval when running the "IGNORE_FONT_FAMILY" command', async () => {
  //     // arrange
  //     const showInformationMessageSpy = sinon.spy(
  //       vscode.window,
  //       "showInformationMessage",
  //     );
  //     const executeCommandSpy = sinon.spy(vscode.commands, "executeCommand");
  //     // act
  //     await vscode.commands.executeCommand(commandMap.ignoreFontFamily);
  //     // assert
  //     const { ignoreFontFamilies } = vscode.workspace.getConfiguration(
  //       "shifty.fontFamilies",
  //     );
  //     expect(ignoreFontFamilies).toContain(defaultFontFamily);
  //     expect(showInformationMessageSpy.firstCall.firstArg).toBe(
  //       'Ignored "Courier New"',
  //     );
  //     expect(getFontFamily()).not.toBe(defaultFontFamily);
  //     expect(executeCommandSpy.lastCall.firstArg).toBe(
  //       commandMap.restartShiftInterval,
  //     );
  //   });
  //   test('ignores the current font family and remove the font family from favorites when running the "IGNORE_FONT_FAMILY" command', async () => {
  //     // arrange
  //     const favorites = [defaultFontFamily, "Menlo"];
  //     await updateConfig("shifty.fontFamilies.favoriteFontFamilies", favorites);
  //     // act
  //     await vscode.commands.executeCommand(commandMap.ignoreFontFamily);
  //     // assert
  //     const { favoriteFontFamilies, ignoreFontFamilies } =
  //       vscode.workspace.getConfiguration("shifty.fontFamilies");
  //     expect(ignoreFontFamilies).toContain(defaultFontFamily);
  //     expect(favoriteFontFamilies).not.toContain(defaultFontFamily);
  //   });
  //   test('primes the font families cache after the "shifty.fontFamilies" config changes', async () => {
  //     // arrange
  //     const rawCache = getRawCache();
  //     // act
  //     await updateConfig("shifty.fontFamilies.includeFontFamilies", [
  //       "Hello World",
  //     ]);
  //     // assert
  //     expect(getRawCache()).not.toEqual(rawCache);
  //   });
  //   test("returns all font families when no font families are ignored", async () => {
  //     // arrange
  //     // change any shifty.fontFamilies config to prime the cache
  //     await updateConfig("shifty.fontFamilies.fallbackFontFamily", "");
  //     // act
  //     const rawCache = getRawCache();
  //     // assert
  //     expect(rawCache.length).toBeGreaterThan(0);
  //   });
  //   test("returns all font families except the ignored font families", async () => {
  //     // arrange
  //     const menlo = "Menlo";
  //     await updateConfig("shifty.fontFamilies.ignoreFontFamilies", [menlo]);
  //     // act
  //     const rawCache = getRawCache();
  //     // assert
  //     expect(rawCache).not.toContain(menlo);
  //   });
  //   test("returns user specified font families", async () => {
  //     // arrange
  //     const helloWorld = "Hello World";
  //     await updateConfig("shifty.fontFamilies.includeFontFamilies", [helloWorld]);
  //     // act
  //     const rawCache = getRawCache();
  //     // assert
  //     expect(rawCache).toContain(helloWorld);
  //   });
  //   test('returns favorite font familes when shiftMode is set to "favorites"', async () => {
  //     // arrange
  //     const favorites = ["Menlo", "Monaco", "PT Mono"];
  //     await updateConfig("shifty.fontFamilies.favoriteFontFamilies", favorites);
  //     await updateConfig("shifty.shiftMode", "favorites");
  //     // act
  //     const rawCache = getRawCache();
  //     // assert
  //     expect(rawCache).toEqual(favorites);
  //   });
  //   test('returns font families without favorites when shiftMode is set to "discovery"', async () => {
  //     // arrange
  //     const menlo = "Menlo";
  //     await updateConfig("shifty.fontFamilies.favoriteFontFamilies", [menlo]);
  //     await updateConfig("shifty.shiftMode", "discovery");
  //     // act
  //     const rawCache = getRawCache();
  //     // assert
  //     expect(rawCache).not.toContain(menlo);
  //   });
  //   test('returns favorite font families when shiftMode is set to "discovery" and all font families have been ignored or favorited', async () => {
  //     // arrange
  //     const favorites = ["Menlo", "Monaco", "PT Mono"];
  //     await updateConfig("shifty.fontFamilies.favoriteFontFamilies", favorites);
  //     await updateConfig("shifty.shiftMode", "discovery");
  //     // act
  //     // ignore the rest of the available font families
  //     await updateConfig("shifty.fontFamilies.ignoreFontFamilies", getRawCache());
  //     // assert
  //     expect(getRawCache()).toEqual(favorites);
  //   });
  //   test('returns the default font family when shiftMode is set to "discovery" and all font families have been ignored', async () => {
  //     // arrange
  //     await updateConfig("shifty.shiftMode", "discovery");
  //     // act
  //     // ignore all font families
  //     await updateConfig("shifty.fontFamilies.ignoreFontFamilies", getRawCache());
  //     // assert
  //     expect(getRawCache()).toEqual([defaultFontFamily]);
  //   });
});
