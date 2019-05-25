import * as vscode from 'vscode';
import {shiftColorTheme} from './color-themes';
import {shiftFontFamily} from './font-families';

let shiftColorThemeIntervalId: NodeJS.Timeout | null = null;
let shiftColorThemeIntervalStartTime: number | null = null;
let shiftFontFamilyIntervalId: NodeJS.Timeout | null = null;
let shiftFontFamilyIntervalStartTime: number | null = null;

export function activateShiftInterval(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'shifty.startShiftInterval',
      startShiftInterval,
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'shifty.stopShiftInterval',
      stopShiftInterval,
    ),
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(event => {
      if (
        event.affectsConfiguration('shifty.shiftInterval') &&
        hasShiftIntervalStarted()
      ) {
        stopShiftInterval();
        startShiftInterval();
      }
    }),
  );
}

export async function startShiftInterval(): Promise<void> {
  const {
    shiftColorThemeIntervalMin,
    shiftFontFamilyIntervalMin,
  } = vscode.workspace.getConfiguration('shifty.shiftInterval');

  const startTime = Date.now();
  const shouldSyncStartTime =
    shiftColorThemeIntervalMin === shiftFontFamilyIntervalMin;

  if (shiftColorThemeIntervalId === null && shiftColorThemeIntervalMin > 0) {
    shiftColorThemeIntervalStartTime = startTime;
    shiftColorThemeIntervalId = setInterval(async () => {
      const nextStartTime = Date.now();
      await shiftColorTheme();

      shiftColorThemeIntervalStartTime = nextStartTime;
      if (shouldSyncStartTime) {
        shiftFontFamilyIntervalStartTime = nextStartTime;
      }
    }, shiftColorThemeIntervalMin * 60 * 1000);
  }

  if (shiftFontFamilyIntervalId === null && shiftFontFamilyIntervalMin > 0) {
    shiftFontFamilyIntervalStartTime = startTime;
    shiftFontFamilyIntervalId = setInterval(async () => {
      const nextStartTime = Date.now();
      await shiftFontFamily();

      shiftFontFamilyIntervalStartTime = nextStartTime;
      if (shouldSyncStartTime) {
        shiftColorThemeIntervalStartTime = nextStartTime;
      }
    }, shiftFontFamilyIntervalMin * 60 * 1000);
  }
}

export function stopShiftInterval(): void {
  if (shiftColorThemeIntervalId !== null) {
    clearInterval(shiftColorThemeIntervalId);
    shiftColorThemeIntervalId = null;
    shiftColorThemeIntervalStartTime = null;
  }

  if (shiftFontFamilyIntervalId !== null) {
    clearInterval(shiftFontFamilyIntervalId);
    shiftFontFamilyIntervalId = null;
    shiftFontFamilyIntervalStartTime = null;
  }
}

export function hasShiftIntervalStarted(): boolean {
  return Boolean(shiftColorThemeIntervalId || shiftFontFamilyIntervalId);
}

export function getRemainingTimeForShiftIntervals(): {
  shiftColorThemeRemainingTime: string | null;
  shiftFontFamilyRemainingTime: string | null;
} {
  const {
    shiftColorThemeIntervalMin,
    shiftFontFamilyIntervalMin,
  } = vscode.workspace.getConfiguration('shifty.shiftInterval');

  return {
    shiftColorThemeRemainingTime: calculateRemainingTime(
      shiftColorThemeIntervalStartTime,
      shiftColorThemeIntervalMin * 60 * 1000,
    ),
    shiftFontFamilyRemainingTime: calculateRemainingTime(
      shiftFontFamilyIntervalStartTime,
      shiftFontFamilyIntervalMin * 60 * 1000,
    ),
  };
}

function calculateRemainingTime(
  startTime: number | null,
  intervalDelayMs: number | null,
): string | null {
  if (!startTime || !intervalDelayMs) return null;

  const totalRemainingSeconds = Math.ceil(
    (startTime + intervalDelayMs - Date.now()) / 1000,
  );

  const min = Math.floor(totalRemainingSeconds / 60);
  const sec = totalRemainingSeconds % 60;
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function _getShiftIntervalIds(): {
  shiftColorThemeIntervalId: NodeJS.Timeout | null;
  shiftFontFamilyIntervalId: NodeJS.Timeout | null;
} {
  return {
    shiftColorThemeIntervalId,
    shiftFontFamilyIntervalId,
  };
}
