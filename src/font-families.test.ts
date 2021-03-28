import expect from "expect";
import { beforeEach } from "mocha";
import sinon from "sinon";
import vscode from "vscode";

import { commandMap, DEFAULT_FONT_FAMILY } from "./constants";
import {
  // getAllFontFamilies,
  // getAvailableFontFamilies,
  getFontFamily,
  getRawCache,
  // setFontFamily,
} from "./font-families";
import { updateConfig } from "./test/utils";

suite("font-families.test.ts", () => {
  // FIXME: Test real implementation, not mock data
  // test('includes the fallback font family when shifty sets "editor.fontFamily"', async () => {
  //   // arrange
  //   // act
  //   const { fontFamily } = vscode.workspace.getConfiguration("editor");

  //   // assert
  //   expect(fontFamily).toBe(`"${DEFAULT_FONT_FAMILY}", monospace`);
  // });

  // test(`sets the font family with out a fallback`, async () => {
  //   // arrage
  //   await updateConfig("shifty.fontFamilies.fallbackFontFamily", null);

  //   // act
  //   await vscode.commands.executeCommand(commandMap.SHIFT_FONT_FAMILY);

  //   // assert
  //   const { fontFamily } = vscode.workspace.getConfiguration("editor");
  //   expect(fontFamily.includes(", ")).toBeFalsy();
  // });

  // test("wraps font families with quotes when they include spaces", async () => {
  //   const fontFamilyWithWhitespace = getAllFontFamilies().find((ff) =>
  //     /\s/.test(ff.id)
  //   );

  //   await setFontFamily(fontFamilyWithWhitespace!.id);

  //   const { fontFamily } = vscode.workspace.getConfiguration("editor");
  //   expect(fontFamily).toBe(`"${fontFamilyWithWhitespace!.id}", monospace`);
  // });

  // test("returns the current font family without quotes", async () => {
  //   const fontFamilyWithWhitespace = getAllFontFamilies().find((ff) =>
  //     /\s/.test(ff.id)
  //   );

  //   await setFontFamily(fontFamilyWithWhitespace!.id);
  //   expect(getFontFamily()).toBe(fontFamilyWithWhitespace!.id);
  // });

  test("registers font family commands when VS Code starts up", async () => {
    // arrange
    // act
    const commands = await vscode.commands.getCommands();

    // assert
    expect(commands).toContain(commandMap.SHIFT_FONT_FAMILY);
    expect(commands).toContain(commandMap.TOGGLE_FAVORITE_FONT_FAMILY);
    expect(commands).toContain(commandMap.IGNORE_FONT_FAMILY);
  });

  test('shifts the font family when running the "SHIFT_FONT_FAMILY" command', async () => {
    // arrange
    const spy = sinon.spy(vscode.commands, "executeCommand");

    // act
    await vscode.commands.executeCommand(commandMap.SHIFT_FONT_FAMILY);

    // assert
    expect(getFontFamily()).not.toBe(DEFAULT_FONT_FAMILY);
    expect(spy.secondCall.firstArg).toBe(commandMap.RESET_SHIFT_INTERVAL);
  });

  // test(`favorites the current font family when running the "commandMap.TOGGLE_FAVORITE_FONT_FAMILY" command`, async () => {
  //   const spy = jest.spyOn(vscode.window, "showInformationMessage");
  //   await vscode.commands.executeCommand(commandMap.TOGGLE_FAVORITE_FONT_FAMILY);

  //   const { favoriteFontFamilies } = vscode.workspace.getConfiguration(
  //     "shifty.fontFamilies"
  //   );
  //   expect(favoriteFontFamilies).toContain(DEFAULT_FONT_FAMILY.id);

  //   const [firstCall] = spy.mock.calls;
  //   expect(formatSnapshot(firstCall)).toMatchInlineSnapshot(
  //     `"['Added \\"Courier New\\" to favorites']"`
  //   );

  //   spy.mockRestore();
  // });

  // test(`unfavorites the current font family when running the "commandMap.TOGGLE_FAVORITE_FONT_FAMILY" command`, async () => {
  //   const favorites = [DEFAULT_FONT_FAMILY.id, "SF Mono"];
  //   await updateConfig("shifty.fontFamilies.favoriteFontFamilies", favorites);

  //   const spy = jest.spyOn(vscode.window, "showInformationMessage");
  //   await vscode.commands.executeCommand(commandMap.TOGGLE_FAVORITE_FONT_FAMILY);

  //   const { favoriteFontFamilies } = vscode.workspace.getConfiguration(
  //     "shifty.fontFamilies"
  //   );
  //   expect(favoriteFontFamilies).not.toContain(DEFAULT_FONT_FAMILY.id);

  //   const [firstCall] = spy.mock.calls;
  //   expect(formatSnapshot(firstCall)).toMatchInlineSnapshot(
  //     `"['Removed \\"Courier New\\" from favorites']"`
  //   );

  //   spy.mockRestore();
  // });

  // test(`ignores the current font family, shifts the font family, and resets the shift interval when running the "commandMap.IGNORE_FONT_FAMILY" command`, async () => {
  //   const showInformationMessageSpy = jest.spyOn(
  //     vscode.window,
  //     "showInformationMessage"
  //   );

  //   const executeCommandSpy = jest.spyOn(vscode.commands, "executeCommand");
  //   await vscode.commands.executeCommand(commandMap.IGNORE_FONT_FAMILY);

  //   const { ignoreFontFamilies } = vscode.workspace.getConfiguration(
  //     "shifty.fontFamilies"
  //   );
  //   expect(ignoreFontFamilies).toContain(DEFAULT_FONT_FAMILY.id);

  //   const [firstCall] = showInformationMessageSpy.mock.calls;
  //   expect(formatSnapshot(firstCall)).toMatchInlineSnapshot(
  //     `"['Ignored \\"Courier New\\"']"`
  //   );

  //   expect(getFontFamily()).not.toBe(DEFAULT_FONT_FAMILY.id);

  //   const [, secondCall] = executeCommandSpy.mock.calls;
  //   expect(secondCall).toEqual([commandMap.RESET_SHIFT_INTERVAL]);

  //   showInformationMessageSpy.mockRestore();
  //   executeCommandSpy.mockRestore();
  // });

  // test(`ignores the current font family and remove the font family from favorites when running the "commandMap.IGNORE_FONT_FAMILY" command`, async () => {
  //   const favorites = [DEFAULT_FONT_FAMILY.id, "SF Mono"];
  //   await updateConfig("shifty.fontFamilies.favoriteFontFamilies", favorites);
  //   await vscode.commands.executeCommand(commandMap.IGNORE_FONT_FAMILY);

  //   const {
  //     favoriteFontFamilies,
  //     ignoreFontFamilies,
  //   } = vscode.workspace.getConfiguration("shifty.fontFamilies");

  //   expect(ignoreFontFamilies).toContain(DEFAULT_FONT_FAMILY.id);
  //   expect(favoriteFontFamilies).not.toContain(DEFAULT_FONT_FAMILY.id);
  // });

  // test('primes the font families cache after the "shifty.fontFamilies" config changes', async () => {
  //   // arrange
  //   const rawCache = getRawCache();

  //   // act
  //   await updateConfig("shifty.fontFamilies.ignoreCodefaceFontFamilies", true);

  //   // assert
  //   expect(getRawCache()).not.toEqual(rawCache);
  // });

  test("returns all font families when no font families are ignored", async () => {
    // arrange
    // change any shifty.fontFamilies config to prime the cache
    await updateConfig("shifty.fontFamilies.fallbackFontFamily", "");

    // act
    const rawCache = getRawCache();

    // assert
    expect(rawCache.length).toBeGreaterThan(0);
  });

  test("returns all font families except the ignored font families", async () => {
    // arrange
    const menlo = "Menlo";
    await updateConfig("shifty.fontFamilies.ignoreFontFamilies", [menlo]);

    // act
    const rawCache = getRawCache();

    // assert
    expect(rawCache).not.toContain(menlo);
  });

  test("returns user specified font families", async () => {
    // arrange
    const dankMono = "Dank Mono";
    await updateConfig("shifty.fontFamilies.includeFontFamilies", [dankMono]);

    // act
    const rawCache = getRawCache();

    // assert
    expect(rawCache).toContain(dankMono);
  });

  test('returns favorite font familes when shiftMode is set to "favorites"', async () => {
    // arrange
    const favorites = ["Menlo", "Monaco", "PT Mono"];
    await updateConfig("shifty.fontFamilies.favoriteFontFamilies", favorites);
    await updateConfig("shifty.shiftMode", "favorites");

    // act
    const rawCache = getRawCache();

    // assert
    expect(rawCache).toEqual(favorites);
  });

  test('returns font families without favorites when shiftMode is set to "discovery"', async () => {
    // arrange
    const menlo = "Menlo";
    await updateConfig("shifty.fontFamilies.favoriteFontFamilies", [menlo]);
    await updateConfig("shifty.shiftMode", "discovery");

    // act
    const rawCache = getRawCache();

    // assert
    expect(rawCache).not.toContain(menlo);
  });

  test('returns favorite font families when shiftMode is set to "discovery" and all font families have been ignored or favorited', async () => {
    // arrange
    const favorites = ["Menlo", "Monaco", "PT Mono"];
    await updateConfig("shifty.fontFamilies.favoriteFontFamilies", favorites);
    await updateConfig("shifty.shiftMode", "discovery");

    // act
    // ignore the rest of the available font families
    await updateConfig("shifty.fontFamilies.ignoreFontFamilies", getRawCache());

    // assert
    expect(getRawCache()).toEqual(favorites);
  });

  test('returns the default font family when shiftMode is set to "discovery" and all font families have been ignored', async () => {
    // arrange
    await updateConfig("shifty.shiftMode", "discovery");

    // act
    // ignore all font families
    await updateConfig("shifty.fontFamilies.ignoreFontFamilies", getRawCache());

    // assert
    expect(getRawCache()).toEqual([DEFAULT_FONT_FAMILY]);
  });
});
