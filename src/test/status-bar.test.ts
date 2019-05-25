import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';
import {DEFAULT_COLOR_THEME} from '../color-themes';
import {DEFAULT_FONT_FAMILY} from '../font-families';
import {setupTest, teardownTest, setConfig} from './test-utils';

suite('status-bar.test.ts', () => {
  setup(async () => {
    await setupTest();
  });

  teardown(async () => {
    await teardownTest();
  });

  test('should register status bar commands when VS Code starts up', async () => {
    const commands = await vscode.commands.getCommands();
    assert.ok(commands.includes('shifty.showStatus'));
  });

  test('should display the current color theme and font family when running the "shifty.showStatus" command', async () => {
    const spy = sinon.spy(vscode.window, 'showInformationMessage');

    await vscode.commands.executeCommand('shifty.showStatus');
    assert.deepStrictEqual(spy.secondCall.args, [
      `Using "${DEFAULT_COLOR_THEME.id}" with "${
        DEFAULT_FONT_FAMILY.id
      }" font family`,
      'Favorite color theme',
      'Favorite font family',
      'Favorite both',
    ]);

    spy.restore();
  });

  test('should display the stopped shift interval status when running the "shifty.showStatus" command', async () => {
    const spy = sinon.spy(vscode.window, 'showInformationMessage');

    await vscode.commands.executeCommand('shifty.showStatus');
    assert.deepStrictEqual(spy.firstCall.args, [
      'Shift interval has not been started',
      'Start shift interval',
    ]);

    spy.restore();
  });

  test('should display the color theme shift interval status when running the "shifty.showStatus" command', async () => {
    const spy = sinon.spy(vscode.window, 'showInformationMessage');

    await setConfig('shifty.shiftInterval.shiftColorThemeIntervalMin', 10);
    await setConfig('shifty.shiftInterval.shiftFontFamilyIntervalMin', null);
    await vscode.commands.executeCommand('shifty.startShiftInterval');

    await vscode.commands.executeCommand('shifty.showStatus');
    assert.ok(
      spy.firstCall.lastArg.match(/^\d{2}:\d{2} until color theme will shift$/),
    );

    await vscode.commands.executeCommand('shifty.stopShiftInterval');

    spy.restore();
  });

  test('should display the font family shift interval status when running the "shifty.showStatus" command', async () => {
    const spy = sinon.spy(vscode.window, 'showInformationMessage');

    await setConfig('shifty.shiftInterval.shiftColorThemeIntervalMin', null);
    await setConfig('shifty.shiftInterval.shiftFontFamilyIntervalMin', 10);
    await vscode.commands.executeCommand('shifty.startShiftInterval');

    await vscode.commands.executeCommand('shifty.showStatus');
    assert.ok(
      spy.firstCall.lastArg.match(/^\d{2}:\d{2} until font family will shift$/),
    );

    await vscode.commands.executeCommand('shifty.stopShiftInterval');

    spy.restore();
  });

  test('should display the color theme and font family shift interval status when running the "shifty.showStatus" command', async () => {
    const spy = sinon.spy(vscode.window, 'showInformationMessage');

    await setConfig('shifty.shiftInterval.shiftColorThemeIntervalMin', 10);
    await setConfig('shifty.shiftInterval.shiftFontFamilyIntervalMin', 10);
    await vscode.commands.executeCommand('shifty.startShiftInterval');

    await vscode.commands.executeCommand('shifty.showStatus');
    assert.ok(
      spy.firstCall.lastArg.match(
        /^\d{2}:\d{2} until color theme & font family will shift$/,
      ),
    );

    await vscode.commands.executeCommand('shifty.stopShiftInterval');

    spy.restore();
  });

  test('should display separate color theme and font family shift interval status when running the "shifty.showStatus" command', async () => {
    const spy = sinon.spy(vscode.window, 'showInformationMessage');

    await setConfig('shifty.shiftInterval.shiftColorThemeIntervalMin', 10);
    await setConfig('shifty.shiftInterval.shiftFontFamilyIntervalMin', 20);
    await vscode.commands.executeCommand('shifty.startShiftInterval');

    await vscode.commands.executeCommand('shifty.showStatus');
    assert.ok(
      spy.firstCall.lastArg.match(/^\d{2}:\d{2} until color theme will shift$/),
    );
    assert.ok(
      spy.secondCall.lastArg.match(
        /^\d{2}:\d{2} until font family will shift$/,
      ),
    );

    await vscode.commands.executeCommand('shifty.stopShiftInterval');

    spy.restore();
  });
});
