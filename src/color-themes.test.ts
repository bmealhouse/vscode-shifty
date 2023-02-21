import assert from "node:assert";
import vscode from "vscode";
import {
  getColorTheme,
  getRawNextColorTheme,
  getAvailableColorThemesForKind,
  getRawColorThemeHistory,
  shiftColorTheme,
} from "./color-themes";
import { commandMap, defaultColorTheme } from "./constants";
import { setupTest } from "./test/setup-test";

suite("color-themes.test.ts", () => {
  test("registers color theme commands at vscode start up", async () => {
    // arrange

    // act
    const commands = await vscode.commands.getCommands();

    // assert
    assert(commands.includes(commandMap.shiftColorTheme));
    assert(commands.includes(commandMap.favoriteColorTheme));
    assert(commands.includes(commandMap.unfavoriteColorTheme));
    assert(commands.includes(commandMap.ignoreColorTheme));
  });

  test('update the next color theme when the "shifty.colorThemes" config changes', async () => {
    // arrange
    const { updateConfig } = setupTest();
    const rawNextColorTheme = getRawNextColorTheme();

    // act
    await updateConfig("shifty.colorThemes.ignoreColorThemes", []);

    // assert
    assert.notStrictEqual(getRawNextColorTheme(), rawNextColorTheme);
  });

  suite('when running the "shiftColorTheme" command', () => {
    test("shift the color theme", async () => {
      // arrange

      // act
      await vscode.commands.executeCommand(commandMap.shiftColorTheme);

      // assert
      const colorTheme = getColorTheme();
      assert.notStrictEqual(colorTheme, "");
      assert.notStrictEqual(colorTheme, defaultColorTheme);
    });

    test("restart the shift interval", async () => {
      // arrange
      const { executeCommandSpy } = setupTest();

      // act
      await vscode.commands.executeCommand(commandMap.shiftColorTheme);

      // assert
      assert(executeCommandSpy.calledWith(commandMap.restartShiftInterval));
    });
  });

  suite('when running the "favoriteColorTheme" command', () => {
    test("favorite the current color theme", async () => {
      // arrange
      const { getFavoriteColorThemes } = setupTest();

      // act
      await vscode.commands.executeCommand(commandMap.favoriteColorTheme);

      // assert
      assert(getFavoriteColorThemes().includes(defaultColorTheme));
    });

    test("set the context for shifty.isFavoriteColorTheme", async () => {
      // arrange
      const { executeCommandSpy } = setupTest();

      // act
      await vscode.commands.executeCommand(commandMap.favoriteColorTheme);

      // assert
      assert(
        executeCommandSpy.calledWithExactly(
          "setContext",
          "shifty.isFavoriteColorTheme",
          true,
        ),
      );
    });

    test("display a notification to the developer", async () => {
      // arrange
      const { showInformationMessaageSpy } = setupTest();

      // act
      await vscode.commands.executeCommand(commandMap.favoriteColorTheme);

      // assert
      assert(
        showInformationMessaageSpy.calledWith(
          `Added "${defaultColorTheme}" to favorites`,
        ),
      );
    });
  });

  suite('when running the "unfavoriteColorTheme" command', () => {
    test("remove the current color theme from favorites", async () => {
      // arrange
      const { seedConfig, getFavoriteColorThemes } = setupTest();
      const favorites = ["Abyss", defaultColorTheme];
      await seedConfig("shifty.colorThemes.favoriteColorThemes", favorites);

      // act
      await vscode.commands.executeCommand(commandMap.unfavoriteColorTheme);

      // assert
      assert.strictEqual(
        getFavoriteColorThemes().includes(defaultColorTheme),
        false,
      );
    });

    test("set the context for shifty.isFavoriteColorTheme", async () => {
      // arrange
      const { seedConfig, executeCommandSpy } = setupTest();
      const favorites = ["Abyss", defaultColorTheme];
      await seedConfig("shifty.colorThemes.favoriteColorThemes", favorites);

      // act
      await vscode.commands.executeCommand(commandMap.unfavoriteColorTheme);

      // assert
      assert(
        executeCommandSpy.calledWithExactly(
          "setContext",
          "shifty.isFavoriteColorTheme",
          false,
        ),
      );
    });

    test("display a notification to the developer", async () => {
      // arrange
      const { seedConfig, showInformationMessaageSpy } = setupTest();
      const favorites = ["Abyss", defaultColorTheme];
      await seedConfig("shifty.colorThemes.favoriteColorThemes", favorites);

      // act
      await vscode.commands.executeCommand(commandMap.unfavoriteColorTheme);

      // assert
      assert(
        showInformationMessaageSpy.calledWith(
          'Removed "Default Dark+" from favorites',
        ),
      );
    });
  });

  suite('when running the "ignoreColorTheme" command', () => {
    test("shift the color theme", async () => {
      // arrange
      const { seedConfig } = setupTest();
      const favorites = ["Abyss", defaultColorTheme];
      await seedConfig("shifty.colorThemes.favoriteColorThemes", favorites);

      // act
      await vscode.commands.executeCommand(commandMap.ignoreColorTheme);

      // assert
      assert.notStrictEqual(getColorTheme(), defaultColorTheme);
    });

    test("restart the shift interval", async () => {
      // arrange
      const { seedConfig, executeCommandSpy } = setupTest();
      const favorites = ["Abyss", defaultColorTheme];
      await seedConfig("shifty.colorThemes.favoriteColorThemes", favorites);

      // act
      await vscode.commands.executeCommand(commandMap.ignoreColorTheme);

      // assert
      assert(executeCommandSpy.calledWith(commandMap.restartShiftInterval));
    });

    test("ignore the current color theme", async () => {
      // arrange
      const { seedConfig, getIgnoreColorThemes } = setupTest();
      const favorites = ["Abyss", defaultColorTheme];
      await seedConfig("shifty.colorThemes.favoriteColorThemes", favorites);

      // act
      await vscode.commands.executeCommand(commandMap.ignoreColorTheme);

      // assert
      assert(getIgnoreColorThemes().includes(defaultColorTheme));
    });

    test("remove the current color theme from favorites", async () => {
      // arrange
      const { seedConfig, getFavoriteColorThemes } = setupTest();
      const favorites = ["Abyss", defaultColorTheme];
      await seedConfig("shifty.colorThemes.favoriteColorThemes", favorites);

      // act
      await vscode.commands.executeCommand(commandMap.ignoreColorTheme);

      // assert
      assert.strictEqual(
        getFavoriteColorThemes().includes(defaultColorTheme),
        false,
      );
    });

    test("set the context for shifty.isFavoriteColorTheme", async () => {
      // arrange
      const { seedConfig, executeCommandSpy } = setupTest();
      const favorites = ["Abyss", defaultColorTheme];
      await seedConfig("shifty.colorThemes.favoriteColorThemes", favorites);

      // act
      await vscode.commands.executeCommand(commandMap.ignoreColorTheme);

      // assert
      assert(
        executeCommandSpy.calledWithExactly(
          "setContext",
          "shifty.isFavoriteColorTheme",
          false,
        ),
      );
    });

    test("display a notification to the developer", async () => {
      // arrange
      const { seedConfig, showInformationMessaageSpy } = setupTest();
      const favorites = ["Abyss", defaultColorTheme];
      await seedConfig("shifty.colorThemes.favoriteColorThemes", favorites);

      // act
      await vscode.commands.executeCommand(commandMap.ignoreColorTheme);

      // assert
      assert(showInformationMessaageSpy.calledWith('Ignored "Default Dark+"'));
    });
  });

  suite("getAvailableColorThemesByKind", () => {
    test('returns at least one color theme when the "colorThemeType" is auto-detect', async () => {
      // arrange
      const { seedConfig } = setupTest();
      await seedConfig("shifty.colorThemes.colorThemeType", "auto-detect");

      // act
      const availableColorThemes = getAvailableColorThemesForKind();

      // assert
      assert(availableColorThemes.length > 0);
    });

    test('returns all dark color themes when the "colorThemeType" is dark', async () => {
      // arrange
      const { seedConfig } = setupTest();
      await seedConfig("shifty.colorThemes.colorThemeType", "dark");

      // act
      const availableColorThemes = getAvailableColorThemesForKind();

      // assert
      const totalDarkDefaultVscodeThemes = 9;
      assert.strictEqual(
        availableColorThemes.length,
        totalDarkDefaultVscodeThemes,
      );
    });

    test('returns all light color themes when the "colorThemeType" is light', async () => {
      // arrange
      const { seedConfig } = setupTest();
      await seedConfig("shifty.colorThemes.colorThemeType", "light");

      // act
      const availableColorThemes = getAvailableColorThemesForKind();

      // assert
      const totalLightDefaultVscodeThemes = 4;
      assert.strictEqual(
        availableColorThemes.length,
        totalLightDefaultVscodeThemes,
      );
    });

    test('returns all high contrast dark color themes when the "colorThemeType" is high-contrast-dark', async () => {
      // arrange
      const { seedConfig } = setupTest();
      await seedConfig(
        "shifty.colorThemes.colorThemeType",
        "high-contrast-dark",
      );

      // act
      const availableColorThemes = getAvailableColorThemesForKind();

      // assert
      const totalHighContrastDarkDefaultVscodeThemes = 1;
      assert.strictEqual(
        availableColorThemes.length,
        totalHighContrastDarkDefaultVscodeThemes,
      );
    });

    test('returns all high contrast light color themes when the "colorThemeType" is high-contrast-light', async () => {
      // arrange
      const { seedConfig } = setupTest();
      await seedConfig(
        "shifty.colorThemes.colorThemeType",
        "high-contrast-light",
      );

      // act
      const availableColorThemes = getAvailableColorThemesForKind();

      // assert
      const totalHighContrastLightDefaultVscodeThemes = 1;
      assert.strictEqual(
        availableColorThemes.length,
        totalHighContrastLightDefaultVscodeThemes,
      );
    });

    test("returns all color themes except the ignored color themes", async () => {
      // arrange
      const { seedConfig } = setupTest();
      const abyss = "Abyss";
      await seedConfig("shifty.colorThemes.ignoreColorThemes", [abyss]);

      // act
      const availableColorThemes = getAvailableColorThemesForKind();

      // assert
      assert.strictEqual(availableColorThemes.includes(abyss), false);
    });

    test('returns color themes that match the active colorThemeType in "favorites" mode', async () => {
      // arrange
      const { seedConfig } = setupTest();
      const favorites = ["Abyss", "Solarized Dark", "Solarized Light"];
      await seedConfig("shifty.colorThemes.favoriteColorThemes", favorites);
      await seedConfig("shifty.shiftMode", "favorites");

      // act
      const availableColorThemes = getAvailableColorThemesForKind();

      // assert
      assert.strictEqual(availableColorThemes.length, 2);
      assert.deepStrictEqual(availableColorThemes, ["Abyss", "Solarized Dark"]);
    });

    test('returns color themes without favorites when shiftMode is set to "discovery"', async () => {
      // arrange
      const { seedConfig } = setupTest();
      const abyss = "Abyss";
      await seedConfig("shifty.colorThemes.favoriteColorThemes", [abyss]);
      await seedConfig("shifty.shiftMode", "discovery");

      // act
      const availableColorThemes = getAvailableColorThemesForKind();

      // assert
      assert.strictEqual(availableColorThemes.includes(abyss), false);
    });

    test('returns favorite color themes when shiftMode is set to "discovery" and all color themes have been ignored or favorited', async () => {
      // arrange
      const { seedConfig, updateConfig } = setupTest();
      const favorites = ["Abyss", "Monokai Dimmed", "Solarized Dark"];
      await seedConfig("shifty.colorThemes.favoriteColorThemes", favorites);
      await seedConfig("shifty.shiftMode", "discovery");

      // act
      // ignore the rest of the available color themes
      await updateConfig(
        "shifty.colorThemes.ignoreColorThemes",
        getAvailableColorThemesForKind(),
      );

      // assert
      assert.deepStrictEqual(getAvailableColorThemesForKind(), favorites);
    });

    test("improves randomization by maintaining a relative history of recent color themes", async () => {
      // arrange
      await shiftColorTheme();
      await shiftColorTheme();
      await shiftColorTheme();

      // act
      await shiftColorTheme();

      // assert
      const history = getRawColorThemeHistory();
      assert.strictEqual(history.includes(getRawNextColorTheme()), false);
      const [a, b, c] = history;
      assert(a !== b && b !== c && c !== a); // assert history is unique
    });

    test('returns the default VS Code color theme when shiftMode is set to "discovery" and all color themes have been ignored', async () => {
      // arrange
      const { seedConfig, updateConfig } = setupTest();
      await seedConfig("shifty.shiftMode", "discovery");

      // act
      // ignore all color themes
      await updateConfig(
        "shifty.colorThemes.ignoreColorThemes",
        getAvailableColorThemesForKind(),
      );

      // assert
      assert.deepStrictEqual(getAvailableColorThemesForKind(), [
        defaultColorTheme,
      ]);
    });
  });
});
