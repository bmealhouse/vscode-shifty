import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';
import {DEFAULT_COLOR_THEME} from '../color-themes';
import {DEFAULT_FONT_FAMILY} from '../font-families';
import {setupTest, teardownTest} from './test-utils';

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

  test('should display the current color theme when running the "shifty.showStatus" command', async () => {
    const spy = sinon.spy(vscode.window, 'showInformationMessage');

    await vscode.commands.executeCommand('shifty.showStatus');
    assert.deepStrictEqual(spy.secondCall.args, [
      `Using "${DEFAULT_COLOR_THEME.id}" color theme`,
      'Favorite',
      'Ignore',
      'Shift',
    ]);

    spy.restore();
  });

  test('should display the current font family when running the "shifty.showStatus" command', async () => {
    const spy = sinon.spy(vscode.window, 'showInformationMessage');

    await vscode.commands.executeCommand('shifty.showStatus');
    assert.deepStrictEqual(spy.firstCall.args, [
      `Using "${DEFAULT_FONT_FAMILY.id}" font family`,
      'Favorite',
      'Ignore',
      'Shift',
    ]);

    spy.restore();
  });
});
