import vscode, { ColorThemeKind } from "vscode";
import { commandMap, defaultColorTheme } from "./constants";
import { log } from "./output-channel";
import { ColorThemeType, ShiftMode } from "./types";
import { getRandomItem, localeCompare, unique } from "./utils";

let nextColorTheme: string;
export const getRawNextColorTheme = () => nextColorTheme; // exported for tests

let colorThemeHistory: string[] = [];
export const getRawColorThemeHistory = () => colorThemeHistory; // exported for tests

export function activateColorThemes(context: vscode.ExtensionContext) {
  nextColorTheme = getNextColorTheme(getColorTheme());
  log(`[color-themes] activation – set "${nextColorTheme}" as nextColorTheme`);

  const favorites = vscode.workspace
    .getConfiguration("shifty.colorThemes")
    .get<string[]>("favoriteColorThemes", []);

  const isFavorite = favorites.includes(nextColorTheme);
  log(
    `[color-themes] activation - setContext "shifty.isFavoriteColorTheme = ${String(
      isFavorite,
    )}"`,
  );
  void vscode.commands.executeCommand(
    "setContext",
    "shifty.isFavoriteColorTheme",
    isFavorite,
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(commandMap.shiftColorTheme, async () => {
      await shiftColorTheme();
      await vscode.commands.executeCommand(commandMap.restartShiftInterval);
    }),

    vscode.commands.registerCommand(commandMap.favoriteColorTheme, async () => {
      const currentColorTheme = getColorTheme();

      if (currentColorTheme) {
        log(`[color-themes] adding "${currentColorTheme}" to favorites…`);
        const config = vscode.workspace.getConfiguration("shifty.colorThemes");
        const favorites = config.get<string[]>("favoriteColorThemes", []);

        await config.update(
          "favoriteColorThemes",
          unique([...favorites, currentColorTheme]).sort(localeCompare),
          vscode.ConfigurationTarget.Global,
        );

        log('[color-themes] setContext "shifty.isFavoriteColorTheme = true"');
        void vscode.commands.executeCommand(
          "setContext",
          "shifty.isFavoriteColorTheme",
          true,
        );

        void vscode.window.showInformationMessage(
          `Added "${currentColorTheme}" to favorites`,
        );
      }
    }),

    vscode.commands.registerCommand(
      commandMap.unfavoriteColorTheme,
      async () => {
        const currentColorTheme = getColorTheme();

        if (currentColorTheme) {
          log(`[color-themes] removing "${currentColorTheme}" from favorites…`);
          const config =
            vscode.workspace.getConfiguration("shifty.colorThemes");
          const favorites = config.get<string[]>("favoriteColorThemes", []);

          await config.update(
            "favoriteColorThemes",
            unique(
              favorites.filter(
                (colorTheme) => colorTheme !== currentColorTheme,
              ),
            ).sort(localeCompare),
            vscode.ConfigurationTarget.Global,
          );

          log(
            '[color-themes] setContext "shifty.isFavoriteColorTheme = false"',
          );
          void vscode.commands.executeCommand(
            "setContext",
            "shifty.isFavoriteColorTheme",
            false,
          );

          void vscode.window.showInformationMessage(
            `Removed "${currentColorTheme}" from favorites`,
          );
        }
      },
    ),

    vscode.commands.registerCommand(commandMap.ignoreColorTheme, async () => {
      const currentColorTheme = getColorTheme();

      if (currentColorTheme) {
        log(`[color-themes] ignoring "${currentColorTheme}"…`);
        await shiftColorTheme();
        await vscode.commands.executeCommand(commandMap.restartShiftInterval);

        const config = vscode.workspace.getConfiguration("shifty.colorThemes");
        const ignoreColorThemes = config.get<string[]>("ignoreColorThemes", []);
        const favoriteColorThemes = config.get<string[]>(
          "favoriteColorThemes",
          [],
        );

        await config.update(
          "ignoreColorThemes",
          unique([...ignoreColorThemes, currentColorTheme]).sort(localeCompare),
          vscode.ConfigurationTarget.Global,
        );

        await config.update(
          "favoriteColorThemes",
          favoriteColorThemes
            .filter((colorTheme) => colorTheme !== currentColorTheme)
            .sort(localeCompare),
          vscode.ConfigurationTarget.Global,
        );

        log('[color-themes] setContext "shifty.isFavoriteColorTheme = false"');
        void vscode.commands.executeCommand(
          "setContext",
          "shifty.isFavoriteColorTheme",
          false,
        );

        void vscode.window.showInformationMessage(
          `Ignored "${currentColorTheme}"`,
        );
      }
    }),

    vscode.workspace.onDidChangeConfiguration(handleDidChangeConfiguration),

    vscode.extensions.onDidChange(() => {
      log(
        `[color-themes] extensions changed – set "${nextColorTheme}" as nextColorTheme`,
      );
      nextColorTheme = getNextColorTheme(getColorTheme());
    }),
  );
}

export function handleDidChangeConfiguration(
  event: vscode.ConfigurationChangeEvent,
) {
  if (
    event.affectsConfiguration("shifty.colorThemes") ||
    event.affectsConfiguration("shifty.shiftMode")
  ) {
    nextColorTheme = getNextColorTheme(getColorTheme());
  }
}

export async function shiftColorTheme() {
  const workbench = vscode.workspace.getConfiguration("workbench");

  await workbench.update(
    "colorTheme",
    nextColorTheme,
    vscode.ConfigurationTarget.Global,
  );

  const favorites = vscode.workspace
    .getConfiguration("shifty.colorThemes")
    .get<string[]>("favoriteColorThemes", []);

  const isFavorite = favorites.includes(nextColorTheme);
  log(
    `[color-themes] setContext "shifty.isFavoriteColorTheme = ${String(
      isFavorite,
    )}"`,
  );
  await vscode.commands.executeCommand(
    "setContext",
    "shifty.isFavoriteColorTheme",
    isFavorite,
  );

  colorThemeHistory.push(nextColorTheme);
  nextColorTheme = getNextColorTheme(nextColorTheme);
}

export function getColorTheme() {
  return vscode.workspace
    .getConfiguration("workbench")
    .get<string>("colorTheme", "");
}

// exported for tests
export function getAvailableColorThemesForKind() {
  const shiftMode = vscode.workspace
    .getConfiguration("shifty")
    .get<ShiftMode>("shiftMode", "default");

  const config = vscode.workspace.getConfiguration("shifty.colorThemes");
  const favoriteColorThemes = config.get<string[]>("favoriteColorThemes", []);
  const ignoreColorThemes = config.get<string[]>("ignoreColorThemes", []);
  const colorThemeType = config.get<ColorThemeType>(
    "colorThemeType",
    "auto-detect",
  );

  const colorThemesForActiveKind: string[] = [];
  for (const extension of vscode.extensions.all) {
    type ThemeType =
      | "vs" // light
      | "vs-dark" // dark
      | "hc-black" // high contrast dark
      | "hc-light"; // high contrast light

    type PackageJson = {
      contributes?: {
        themes?: Array<{
          id?: string;
          label: string;
          uiTheme: ThemeType;
          path: string;
        }>;
      };
    };

    const packageJson = extension.packageJSON as PackageJson;
    const themes = packageJson?.contributes?.themes ?? [];

    for (const theme of themes) {
      const kind = {
        vs: ColorThemeKind.Light,
        "vs-dark": ColorThemeKind.Dark,
        "hc-black": ColorThemeKind.HighContrast,
        "hc-light": ColorThemeKind.HighContrastLight,
      }[theme.uiTheme];

      const type = {
        vs: "light",
        "vs-dark": "dark",
        "hc-black": "high-contrast-dark",
        "hc-light": "high-contrast-light",
      }[theme.uiTheme];

      if (colorThemeType === "auto-detect") {
        if (kind === vscode.window.activeColorTheme.kind) {
          colorThemesForActiveKind.push(theme.id ?? theme.label);
        }
      } else if (type === colorThemeType) {
        colorThemesForActiveKind.push(theme.id ?? theme.label);
      }
    }
  }

  let availableColorThemes: string[] = [];

  if (shiftMode === "favorites") {
    availableColorThemes = favoriteColorThemes.filter((colorTheme) =>
      colorThemesForActiveKind.includes(colorTheme),
    );
  } else {
    availableColorThemes = colorThemesForActiveKind.filter(
      (colorTheme) => !ignoreColorThemes.includes(colorTheme),
    );

    if (shiftMode === "discovery") {
      // exclude favorites in discovery mode
      availableColorThemes = availableColorThemes.filter(
        (colorTheme) => !favoriteColorThemes.includes(colorTheme),
      );
    }

    if (availableColorThemes.length === 0) {
      // fallback to favorites
      availableColorThemes = favoriteColorThemes.filter((colorTheme) =>
        colorThemesForActiveKind.includes(colorTheme),
      );
    }
  }

  const historyToKeep = Math.floor(colorThemesForActiveKind.length / 3);
  colorThemeHistory = colorThemeHistory.slice(-historyToKeep);
  if (colorThemeHistory.length > 0) {
    availableColorThemes = availableColorThemes.filter(
      (colorTheme) => !colorThemeHistory.includes(colorTheme),
    );
  }

  if (availableColorThemes.length === 0) {
    availableColorThemes = [defaultColorTheme];
  }

  return availableColorThemes;
}

function getNextColorTheme(currentColorTheme: string) {
  return getRandomItem(
    getAvailableColorThemesForKind().filter(
      (colorTheme) => currentColorTheme !== colorTheme,
    ),
  );
}
