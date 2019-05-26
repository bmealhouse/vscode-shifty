import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';
import {
  _getColorThemesCache,
  getColorTheme,
  getAvailableColorThemes,
  ColorThemeStyle,
  DEFAULT_COLOR_THEME,
} from '../color-themes';
import {setupTest, teardownTest, getConfig, setConfig} from './test-utils';

suite('color-themes.test.ts', () => {
  setup(async () => {
    await setupTest();
  });

  teardown(async () => {
    await teardownTest();
  });

  test('should register color theme commands when VS Code starts up', async () => {
    const commands = await vscode.commands.getCommands();
    assert.ok(commands.includes('shifty.shiftColorTheme'));
    assert.ok(commands.includes('shifty.favoriteColorTheme'));
    assert.ok(commands.includes('shifty.ignoreColorTheme'));
  });

  test('should shift the color theme when running the "shifty.shiftColorTheme" command', async () => {
    await vscode.commands.executeCommand('shifty.shiftColorTheme');
    assert.notStrictEqual(getColorTheme(), DEFAULT_COLOR_THEME.id);
  });

  test('should favorite the current color theme when running the "shifty.favoriteColorTheme" command', async () => {
    const spy = sinon.spy(vscode.window, 'showInformationMessage');
    await vscode.commands.executeCommand('shifty.favoriteColorTheme');

    assert.ok(
      getConfig('shifty.colorThemes.favoriteColorThemes').includes(
        DEFAULT_COLOR_THEME.id,
      ),
    );
    assert.strictEqual(
      spy.firstCall.lastArg,
      `Added "${DEFAULT_COLOR_THEME.id}" to favorites`,
    );

    spy.restore();
  });

  test('should ignore the current color theme and shift the color theme when running the "shifty.ignoreColorTheme" command', async () => {
    const spy = sinon.spy(vscode.window, 'showInformationMessage');
    await vscode.commands.executeCommand('shifty.ignoreColorTheme');

    assert.ok(
      getConfig('shifty.colorThemes.ignoreColorThemes').includes(
        DEFAULT_COLOR_THEME.id,
      ),
    );
    assert.strictEqual(
      spy.firstCall.lastArg,
      `Ignored "${DEFAULT_COLOR_THEME.id}"`,
    );
    assert.notStrictEqual(getColorTheme(), DEFAULT_COLOR_THEME.id);

    spy.restore();
  });

  test('should ignore the current color theme and remove the color theme from favorites when running the "shifty.ignoreColorTheme" command', async () => {
    const favorites = ['Abyss', DEFAULT_COLOR_THEME.id];
    await setConfig('shifty.colorThemes.favoriteColorThemes', favorites);
    assert.deepStrictEqual(
      getConfig('shifty.colorThemes.favoriteColorThemes'),
      favorites,
    );

    await vscode.commands.executeCommand('shifty.ignoreColorTheme');
    const ignoreColorThemes = getConfig('shifty.colorThemes.ignoreColorThemes');
    assert.ok(ignoreColorThemes.includes(DEFAULT_COLOR_THEME.id));

    const favoriteColorThemes = getConfig(
      'shifty.colorThemes.favoriteColorThemes',
    );
    assert.ok(!favoriteColorThemes.includes(DEFAULT_COLOR_THEME.id));
    assert.strictEqual(favoriteColorThemes.length, favorites.length - 1);
  });

  // TODO: left off here
  test('should prime the color themes cache after the "shifty.colorThemes" config changes', async () => {
    const originalColorThemesCache = _getColorThemesCache();
    await setConfig('shifty.colorThemes.ignoreLightColorThemes', true);
    assert.notDeepStrictEqual(_getColorThemesCache(), originalColorThemesCache);
  });

  test('should return all color themes when no color themes are ignored', () => {
    const TOTAL_DEFAULT_VSCODE_THEMES = 14;
    assert.strictEqual(
      getAvailableColorThemes().length,
      TOTAL_DEFAULT_VSCODE_THEMES - 1,
    );
  });

  test('should return all color themes except the current color theme', () => {
    assert.ok(
      !getAvailableColorThemes().find(ct => ct.id === DEFAULT_COLOR_THEME.id),
    );
  });

  test('should return all color themes except the ignored color themes', async () => {
    const abyss = 'Abyss';
    await setConfig('shifty.colorThemes.ignoreColorThemes', [abyss]);
    assert.ok(!getAvailableColorThemes().find(ct => ct.id === abyss));
  });

  test('should return no dark color themes when ignored', async () => {
    await setConfig('shifty.colorThemes.ignoreDarkColorThemes', true);
    assert.ok(
      getAvailableColorThemes().every(ct => ct.style !== ColorThemeStyle.DARK),
    );
  });

  test('should return no light color themes when ignored', async () => {
    await setConfig('shifty.colorThemes.ignoreLightColorThemes', true);
    assert.ok(
      getAvailableColorThemes().every(ct => ct.style !== ColorThemeStyle.LIGHT),
    );
  });

  test('should return no high contrast color themes when ignored', async () => {
    await setConfig('shifty.colorThemes.ignoreHighContrastColorThemes', true);
    assert.ok(
      getAvailableColorThemes().every(
        ct => ct.style !== ColorThemeStyle.HIGH_CONTRAST,
      ),
    );
  });

  test('should return the default color theme when all color theme types are ignored', async () => {
    await setConfig('shifty.colorThemes.ignoreDarkColorThemes', true);
    await setConfig('shifty.colorThemes.ignoreLightColorThemes', true);
    await setConfig('shifty.colorThemes.ignoreHighContrastColorThemes', true);
    assert.deepStrictEqual(_getColorThemesCache(), [DEFAULT_COLOR_THEME]);
  });

  test('should return favorite color themes when shiftMode is set to "favorites"', async () => {
    const favorites = ['Abyss', 'Monokai Dimmed', 'Solarized Dark'];
    await setConfig('shifty.colorThemes.favoriteColorThemes', favorites);
    await setConfig('shifty.shiftMode', 'favorites');
    assert.deepStrictEqual(getAvailableColorThemes(), favorites);
  });

  test('should return color themes without favorites when shiftMode is set to "discovery"', async () => {
    const abyss = 'Abyss';
    await setConfig('shifty.colorThemes.favoriteColorThemes', [abyss]);
    await setConfig('shifty.shiftMode', 'discovery');
    assert.ok(!getAvailableColorThemes().find(ct => ct.id === abyss));
  });

  test('should return favorite color themes when shiftMode is set to "discovery" and all color themes have been ignored or favorited', async () => {
    const favorites = ['Abyss', 'Monokai Dimmed', 'Solarized Dark'];
    await setConfig('shifty.colorThemes.favoriteColorThemes', favorites);
    await setConfig('shifty.shiftMode', 'discovery');

    // ignore the rest of the available color themes
    await setConfig('shifty.colorThemes.ignoreColorThemes', [
      ...getAvailableColorThemes().map(ct => ct.id),
      DEFAULT_COLOR_THEME.id,
    ]);

    assert.deepStrictEqual(getAvailableColorThemes(), favorites);
  });

  test('should return the default VS Code color theme when shiftMode is set to "discovery" and all color themes have been ignored', async () => {
    await setConfig('shifty.shiftMode', 'discovery');

    // ignore all color themes
    await setConfig('shifty.colorThemes.ignoreColorThemes', [
      ...getAvailableColorThemes().map(ct => ct.id),
      DEFAULT_COLOR_THEME.id,
    ]);

    assert.deepStrictEqual(_getColorThemesCache(), [DEFAULT_COLOR_THEME]);
  });
});
