import * as assert from 'assert';
import * as vscode from 'vscode';
import {getColorTheme, DEFAULT_COLOR_THEME} from '../color-themes';
import {getFontFamily, DEFAULT_FONT_FAMILY} from '../font-families';
import {
  _getShiftIntervalIds,
  hasShiftIntervalStarted,
  getRemainingTimeForShiftIntervals,
} from '../shift-interval';
import {setupTest, teardownTest, setConfig, wait} from './test-utils';

suite('shift-interval.test.ts', () => {
  setup(async () => {
    await setupTest();
  });

  teardown(async () => {
    await teardownTest();
  });

  test('should not start the shift interval when VS Code starts up', () => {
    assert.ok(!hasShiftIntervalStarted());
  });

  test('should register shift interval commands when VS Code starts up', async () => {
    const commands = await vscode.commands.getCommands();
    assert.ok(commands.includes('shifty.startShiftInterval'));
    assert.ok(commands.includes('shifty.stopShiftInterval'));
  });

  test('should return nulls for remaining time when the shift interval has not been started', () => {
    assert.ok(!hasShiftIntervalStarted());

    const {
      shiftColorThemeRemainingTime,
      shiftFontFamilyRemainingTime,
    } = getRemainingTimeForShiftIntervals();

    assert.strictEqual(shiftColorThemeRemainingTime, null);
    assert.strictEqual(shiftFontFamilyRemainingTime, null);
  });

  test('should start and stop the shift interval using commands', async () => {
    assert.ok(!hasShiftIntervalStarted());
    await vscode.commands.executeCommand('shifty.startShiftInterval');
    assert.ok(hasShiftIntervalStarted());
    await vscode.commands.executeCommand('shifty.stopShiftInterval');
    assert.ok(!hasShiftIntervalStarted());
  });

  test('should not start shift intervals when set to 0ms', async () => {
    await setConfig('shifty.shiftInterval.shiftColorThemeIntervalMin', 0);
    await setConfig('shifty.shiftInterval.shiftFontFamilyIntervalMin', 0);
    await vscode.commands.executeCommand('shifty.startShiftInterval');

    const {
      shiftColorThemeIntervalId,
      shiftFontFamilyIntervalId,
    } = _getShiftIntervalIds();

    assert.ok(!hasShiftIntervalStarted());
    assert.strictEqual(shiftColorThemeIntervalId, null);
    assert.strictEqual(shiftFontFamilyIntervalId, null);
  });

  test('should not start shift intervals when set to null', async () => {
    await setConfig('shifty.shiftInterval.shiftColorThemeIntervalMin', null);
    await setConfig('shifty.shiftInterval.shiftFontFamilyIntervalMin', null);
    await vscode.commands.executeCommand('shifty.startShiftInterval');

    const {
      shiftColorThemeIntervalId,
      shiftFontFamilyIntervalId,
    } = _getShiftIntervalIds();

    assert.ok(!hasShiftIntervalStarted());
    assert.strictEqual(shiftColorThemeIntervalId, null);
    assert.strictEqual(shiftFontFamilyIntervalId, null);
  });

  test('should restart the shift interval when the shift interval has been started and the config changes', async () => {
    await vscode.commands.executeCommand('shifty.startShiftInterval');
    assert.ok(hasShiftIntervalStarted());

    const shiftIntervalIds = _getShiftIntervalIds();
    await setConfig('shifty.shiftInterval.shiftColorThemeIntervalMin', 10);
    assert.ok(hasShiftIntervalStarted());
    assert.notDeepStrictEqual(_getShiftIntervalIds(), shiftIntervalIds);

    await vscode.commands.executeCommand('shifty.stopShiftInterval');
  });

  test('should do nothing when the shift interval has not been started and the config changes', async () => {
    assert.ok(!hasShiftIntervalStarted());

    await setConfig('shifty.shiftInterval.shiftFontFamilyIntervalMin', 10);

    const {
      shiftColorThemeIntervalId,
      shiftFontFamilyIntervalId,
    } = _getShiftIntervalIds();

    assert.ok(!hasShiftIntervalStarted());
    assert.strictEqual(shiftColorThemeIntervalId, null);
    assert.strictEqual(shiftFontFamilyIntervalId, null);
  });

  test('should shift the color theme when the shift interval has completed', async () => {
    await vscode.commands.executeCommand('shifty.startShiftInterval');
    assert.ok(hasShiftIntervalStarted());

    await setConfig('shifty.colorThemes.ignoreColorThemes', [
      DEFAULT_COLOR_THEME.id,
    ]);
    await setConfig('shifty.shiftInterval.shiftColorThemeIntervalMin', 0.0004); // 24ms
    await wait(100); // need to wait at least 100ms for this test to work
    await vscode.commands.executeCommand('shifty.stopShiftInterval');

    assert.notStrictEqual(getColorTheme(), DEFAULT_COLOR_THEME.id);
  });

  test('should shift the color theme when the shift interval has completed', async () => {
    await vscode.commands.executeCommand('shifty.startShiftInterval');
    assert.ok(hasShiftIntervalStarted());

    await setConfig('shifty.fontFamilies.ignoreFontFamilies', [
      DEFAULT_FONT_FAMILY.id,
    ]);
    await setConfig('shifty.shiftInterval.shiftFontFamilyIntervalMin', 0.0004); // 24ms
    await wait(100); // need to wait at least 100ms for this test to work
    await vscode.commands.executeCommand('shifty.stopShiftInterval');

    assert.notStrictEqual(getFontFamily(), DEFAULT_FONT_FAMILY.id);
  });

  test('should return remaining time when the shift interval has been started', async () => {
    await vscode.commands.executeCommand('shifty.startShiftInterval');
    assert.ok(hasShiftIntervalStarted());

    const {
      shiftColorThemeRemainingTime,
      shiftFontFamilyRemainingTime,
    } = getRemainingTimeForShiftIntervals();
    assert.ok(/^\d{2}:\d{2}$/.exec(shiftColorThemeRemainingTime as string));
    assert.ok(/^\d{2}:\d{2}$/.exec(shiftFontFamilyRemainingTime as string));

    await vscode.commands.executeCommand('shifty.stopShiftInterval');
  });
});
