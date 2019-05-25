import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';
import {getColorTheme, DEFAULT_COLOR_THEME} from '../color-themes';
import {getFontFamily, DEFAULT_FONT_FAMILY} from '../font-families';
import {setupTest, teardownTest, getConfig} from './test-utils';

suite('extension.test.ts', () => {
  setup(async () => {
    await setupTest();
  });

  teardown(async () => {
    await teardownTest();
  });

  test('should register global commands when VS Code starts up', async () => {
    const commands = await vscode.commands.getCommands();
    assert.ok(commands.includes('shifty.shiftBoth'));
  });

  test('should shift the color theme and font family when running the "shifty.shiftBoth" command', async () => {
    await vscode.commands.executeCommand('shifty.shiftBoth');
    assert.notStrictEqual(getColorTheme(), DEFAULT_COLOR_THEME.id);
    assert.notStrictEqual(getFontFamily(), DEFAULT_FONT_FAMILY.id);
  });

  test('should favorite the color theme and font family when running the "shifty.favoriteBoth" command', async () => {
    const spy = sinon.spy(vscode.window, 'showInformationMessage');

    await vscode.commands.executeCommand('shifty.favoriteBoth');
    assert.ok(
      getConfig('shifty.fontFamilies.favoriteFontFamilies').includes(
        DEFAULT_FONT_FAMILY.id,
      ),
    );
    assert.ok(
      getConfig('shifty.colorThemes.favoriteColorThemes').includes(
        DEFAULT_COLOR_THEME.id,
      ),
    );
    assert.strictEqual(
      spy.firstCall.lastArg,
      `Added "${DEFAULT_COLOR_THEME.id}" and "${
        DEFAULT_FONT_FAMILY.id
      }" to favorites`,
    );

    spy.restore();
  });

  test('should ignore the color theme and font family when running the "shifty.ignoreBoth" command', async () => {
    const spy = sinon.spy(vscode.window, 'showInformationMessage');

    await vscode.commands.executeCommand('shifty.ignoreBoth');
    assert.ok(
      getConfig('shifty.fontFamilies.ignoreFontFamilies').includes(
        DEFAULT_FONT_FAMILY.id,
      ),
    );
    assert.ok(
      getConfig('shifty.colorThemes.ignoreColorThemes').includes(
        DEFAULT_COLOR_THEME.id,
      ),
    );
    assert.strictEqual(
      spy.firstCall.lastArg,
      `Ignored "${DEFAULT_COLOR_THEME.id}" and "${DEFAULT_FONT_FAMILY.id}"`,
    );

    spy.restore();
  });
});
