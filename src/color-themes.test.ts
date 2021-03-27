import expect from "expect";
import { beforeEach } from "mocha";
import sinon from "sinon";
import vscode from "vscode";

import { commandMap, DEFAULT_COLOR_THEME } from "./constants";
import {
  getColorTheme,
  getRawCache,
  getRawCacheWithMetadata,
} from "./color-themes";
import { resetVscodeConfig } from "./test/mock-vscode-config";
import { updateConfig } from "./test/utils";

suite("color-themes.test.ts", () => {
  beforeEach(() => {
    resetVscodeConfig();
  });

  test("registers color theme commands at vscode start up", async () => {
    // arrange
    // act
    const commands = await vscode.commands.getCommands();

    // assert
    expect(commands).toContain(commandMap.SHIFT_COLOR_THEME);
    expect(commands).toContain(commandMap.TOGGLE_FAVORITE_COLOR_THEME);
    expect(commands).toContain(commandMap.IGNORE_COLOR_THEME);
  });

  test('shifts the color theme when running the "SHIFT_COLOR_THEME" command', async () => {
    // arrange
    const spy = sinon.spy(vscode.commands, "executeCommand");

    // act
    await vscode.commands.executeCommand(commandMap.SHIFT_COLOR_THEME);

    // assert
    expect(getColorTheme()).not.toBe(DEFAULT_COLOR_THEME);
    expect(spy.secondCall.firstArg).toBe(commandMap.RESET_SHIFT_INTERVAL);

    spy.restore();
  });

  test('favorites the current color theme when running the "TOGGLE_FAVORITE_COLOR_THEME" command', async () => {
    // arrange
    const spy = sinon.spy(vscode.window, "showInformationMessage");

    // act
    await vscode.commands.executeCommand(
      commandMap.TOGGLE_FAVORITE_COLOR_THEME
    );

    // assert
    const { favoriteColorThemes } = vscode.workspace.getConfiguration(
      "shifty.colorThemes"
    );
    expect(favoriteColorThemes).toContain(DEFAULT_COLOR_THEME);
    expect(spy.firstCall.firstArg).toBe('Added "Default Dark+" to favorites');

    spy.restore();
  });

  test('unfavorites the current color theme when running the "TOGGLE_FAVORITE_COLOR_THEME" command', async () => {
    // arrange
    const favorites = ["Abyss", DEFAULT_COLOR_THEME];
    await updateConfig("shifty.colorThemes.favoriteColorThemes", favorites);
    const spy = sinon.spy(vscode.window, "showInformationMessage");

    // act
    await vscode.commands.executeCommand(
      commandMap.TOGGLE_FAVORITE_COLOR_THEME
    );

    // assert
    const { favoriteColorThemes } = vscode.workspace.getConfiguration(
      "shifty.colorThemes"
    );
    expect(favoriteColorThemes).not.toContain(DEFAULT_COLOR_THEME);
    expect(spy.firstCall.firstArg).toBe(
      'Removed "Default Dark+" from favorites'
    );

    spy.restore();
  });

  test('ignores the current color theme, shifts the color theme, and resets the shift interval when running the "IGNORE_COLOR_THEME" command', async () => {
    // arrange
    const showInformationMessaageSpy = sinon.spy(
      vscode.window,
      "showInformationMessage"
    );
    const executeCommandSpy = sinon.spy(vscode.commands, "executeCommand");

    // act
    await vscode.commands.executeCommand(commandMap.IGNORE_COLOR_THEME);

    // assert
    const { ignoreColorThemes } = vscode.workspace.getConfiguration(
      "shifty.colorThemes"
    );
    expect(ignoreColorThemes).toContain(DEFAULT_COLOR_THEME);
    expect(showInformationMessaageSpy.firstCall.firstArg).toBe(
      'Ignored "Default Dark+"'
    );
    expect(getColorTheme()).not.toBe(DEFAULT_COLOR_THEME);
    expect(executeCommandSpy.secondCall.firstArg).toBe(
      commandMap.RESET_SHIFT_INTERVAL
    );

    showInformationMessaageSpy.restore();
    executeCommandSpy.restore();
  });

  test('ignores the current color theme and removes the color theme from favorites when running the "IGNORE_COLOR_THEME" command', async () => {
    // arrange
    const favorites = ["Abyss", DEFAULT_COLOR_THEME];
    await updateConfig("shifty.colorThemes.favoriteColorThemes", favorites);

    // act
    await vscode.commands.executeCommand(commandMap.IGNORE_COLOR_THEME);

    // assert
    const {
      favoriteColorThemes,
      ignoreColorThemes,
    } = vscode.workspace.getConfiguration("shifty.colorThemes");
    expect(ignoreColorThemes).toContain(DEFAULT_COLOR_THEME);
    expect(favoriteColorThemes).not.toContain(DEFAULT_COLOR_THEME);
  });

  test('primes the color themes cache after the "shifty.colorThemes" config changes', async () => {
    // arrange
    const rawCache = getRawCache();

    // act
    await updateConfig("shifty.colorThemes.ignoreLightColorThemes", true);

    // assert
    expect(getRawCache()).not.toEqual(rawCache);
  });

  test("returns all color themes when no color themes are ignored", async () => {
    // arrange
    // change any shifty.colorThemes config to prime the cache
    await updateConfig("shifty.colorThemes.favoriteColorThemes", []);

    // act
    const rawCache = getRawCache();

    // assert
    const TOTAL_DEFAULT_VSCODE_THEMES = 14;
    expect(rawCache.length).toBe(TOTAL_DEFAULT_VSCODE_THEMES);
  });

  test("returns all color themes except the ignored color themes", async () => {
    // arrange
    const abyss = "Abyss";
    await updateConfig("shifty.colorThemes.ignoreColorThemes", [abyss]);

    // act
    const rawCache = getRawCache();

    // assert
    expect(rawCache).not.toContain(abyss);
  });

  test("returns no dark color themes when ignored", async () => {
    // arrange
    await updateConfig("shifty.colorThemes.ignoreDarkColorThemes", true);

    // act
    const rawCacheWithMetadata = getRawCacheWithMetadata();

    // assert
    expect(
      rawCacheWithMetadata.every((colorTheme) => colorTheme.type !== "vs-dark")
    ).toBeTruthy();
  });

  test('returns no dark color themes when ignored and in "favorites" mode', async () => {
    // arrange
    await updateConfig("shifty.shiftMode", "favorites");
    const favorites = ["Abyss", "Solarized Light", "Default High Contrast"];
    await updateConfig("shifty.colorThemes.favoriteColorThemes", favorites);
    await updateConfig("shifty.colorThemes.ignoreDarkColorThemes", true);

    // act
    const rawCacheWithMetadata = getRawCacheWithMetadata();

    // assert
    expect(
      rawCacheWithMetadata.every((colorTheme) => colorTheme.type !== "vs-dark")
    ).toBeTruthy();
  });

  test("returns no light color themes when ignored", async () => {
    // arrange
    await updateConfig("shifty.colorThemes.ignoreLightColorThemes", true);

    // act
    const rawCacheWithMetadata = getRawCacheWithMetadata();

    // assert
    expect(
      rawCacheWithMetadata.every((colorTheme) => colorTheme.type !== "vs")
    ).toBeTruthy();
  });

  test('returns no light color themes when ignored and in "favorites" mode', async () => {
    // arrange
    await updateConfig("shifty.shiftMode", "favorites");
    const favorites = ["Abyss", "Solarized Light", "Default High Contrast"];
    await updateConfig("shifty.colorThemes.favoriteColorThemes", favorites);
    await updateConfig("shifty.colorThemes.ignoreLightColorThemes", true);

    // act
    const rawCacheWithMetadata = getRawCacheWithMetadata();

    // assert
    expect(
      rawCacheWithMetadata.every((colorTheme) => colorTheme.type !== "vs")
    ).toBeTruthy();
  });

  test("returns no high contrast color themes when ignored", async () => {
    // arrange
    await updateConfig(
      "shifty.colorThemes.ignoreHighContrastColorThemes",
      true
    );

    // act
    const rawCacheWithMetadata = getRawCacheWithMetadata();

    // assert
    expect(
      rawCacheWithMetadata.every((colorTheme) => colorTheme.type !== "hc-black")
    ).toBeTruthy();
  });

  test('returns no hight contrast color themes when ignored and in "favorites" mode', async () => {
    // arrange
    await updateConfig("shifty.shiftMode", "favorites");
    const favorites = ["Abyss", "Solarized Light", "Default High Contrast"];
    await updateConfig("shifty.colorThemes.favoriteColorThemes", favorites);
    await updateConfig(
      "shifty.colorThemes.ignoreHighContrastColorThemes",
      true
    );

    // act
    const rawCacheWithMetadata = getRawCacheWithMetadata();

    // assert
    expect(
      rawCacheWithMetadata.every((colorTheme) => colorTheme.type !== "hc-black")
    ).toBeTruthy();
  });

  test("returns the default color theme when all color theme types are ignored", async () => {
    // arrange
    await updateConfig("shifty.colorThemes.ignoreDarkColorThemes", true);
    await updateConfig("shifty.colorThemes.ignoreLightColorThemes", true);
    await updateConfig(
      "shifty.colorThemes.ignoreHighContrastColorThemes",
      true
    );

    // act
    const rawCache = getRawCache();

    // assert
    expect(rawCache).toEqual([DEFAULT_COLOR_THEME]);
  });

  test('returns favorite color themes when shiftMode is set to "favorites"', async () => {
    // arrange
    const favorites = ["Abyss", "Monokai Dimmed", "Solarized Dark"];
    await updateConfig("shifty.colorThemes.favoriteColorThemes", favorites);
    await updateConfig("shifty.shiftMode", "favorites");

    // act
    const rawCache = getRawCache();

    // assert
    expect(rawCache).toEqual(favorites);
  });

  test('returns color themes without favorites when shiftMode is set to "discovery"', async () => {
    // arrange
    const abyss = "Abyss";
    await updateConfig("shifty.colorThemes.favoriteColorThemes", [abyss]);
    await updateConfig("shifty.shiftMode", "discovery");

    // act
    const rawCache = getRawCache();

    // assert
    expect(rawCache).not.toContain(abyss);
  });

  test('returns favorite color themes when shiftMode is set to "discovery" and all color themes have been ignored or favorited', async () => {
    // arrange
    const favorites = ["Abyss", "Monokai Dimmed", "Solarized Dark"];
    await updateConfig("shifty.colorThemes.favoriteColorThemes", favorites);
    await updateConfig("shifty.shiftMode", "discovery");

    // act
    // ignore the rest of the available color themes
    await updateConfig("shifty.colorThemes.ignoreColorThemes", getRawCache());

    // assert
    expect(getRawCache()).toEqual(favorites);
  });

  test('returns the default VS Code color theme when shiftMode is set to "discovery" and all color themes have been ignored', async () => {
    // arrange
    await updateConfig("shifty.shiftMode", "discovery");

    // act
    // ignore all color themes
    await updateConfig("shifty.colorThemes.ignoreColorThemes", getRawCache());

    // assert
    expect(getRawCache()).toEqual([DEFAULT_COLOR_THEME]);
  });
});
