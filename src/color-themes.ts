import vscode from "vscode";

import { commandMap, DEFAULT_COLOR_THEME } from "./constants";
import { getRandomItem, localeCompare, unique } from "./utils";

interface ColorThemeWithMetadata {
  name: string;
  type: "vs" | "vs-dark" | "hc-black";
}

let cache: string[];
let cacheWithMetadata: ColorThemeWithMetadata[];
let nextColorTheme: string;

export const getRawCache = () => cache;
export const getRawCacheWithMetadata = () => cacheWithMetadata;

export function activateColorThemes(context: vscode.ExtensionContext): void {
  cache = getCache();
  nextColorTheme = getNextColorTheme();

  // TODO: setContext in activation

  context.subscriptions.push(
    vscode.commands.registerCommand(commandMap.SHIFT_COLOR_THEME, async () => {
      await shiftColorTheme();
      await vscode.commands.executeCommand(commandMap.RESTART_SHIFT_INTERVAL);
    }),
    vscode.commands.registerCommand(
      commandMap.FAVORITE_COLOR_THEME,
      async () => {
        const currentColorTheme = getColorTheme();
        const config = vscode.workspace.getConfiguration("shifty.colorThemes");
        const favorites = config.get<string[]>("favoriteColorThemes", []);

        await config.update(
          "favoriteColorThemes",
          unique([...favorites, currentColorTheme]).sort(localeCompare),
          vscode.ConfigurationTarget.Global
        );
        void vscode.window.showInformationMessage(
          `Added "${currentColorTheme}" to favorites`
        );
      }
    ),
    vscode.commands.registerCommand(
      commandMap.UNFAVORITE_COLOR_THEME,
      async () => {
        const currentColorTheme = getColorTheme();
        const config = vscode.workspace.getConfiguration("shifty.colorThemes");
        const favorites = config.get<string[]>("favoriteColorThemes", []);

        await config.update(
          "favoriteColorThemes",
          unique(
            favorites.filter((colorTheme) => colorTheme !== currentColorTheme)
          ).sort(localeCompare),
          vscode.ConfigurationTarget.Global
        );
        void vscode.window.showInformationMessage(
          `Removed "${currentColorTheme}" from favorites`
        );
      }
    ),
    vscode.commands.registerCommand(commandMap.IGNORE_COLOR_THEME, async () => {
      const currentColorTheme = getColorTheme();

      await shiftColorTheme();
      await vscode.commands.executeCommand(commandMap.RESTART_SHIFT_INTERVAL);

      const config = vscode.workspace.getConfiguration("shifty.colorThemes");
      const ignoreColorThemes = config.get<string[]>("ignoreColorThemes", []);
      const favoriteColorThemes = config.get<string[]>(
        "favoriteColorThemes",
        []
      );

      await config.update(
        "ignoreColorThemes",
        unique([...ignoreColorThemes, currentColorTheme]).sort(localeCompare),
        vscode.ConfigurationTarget.Global
      );

      await config.update(
        "favoriteColorThemes",
        favoriteColorThemes
          .filter((colorTheme) => colorTheme !== currentColorTheme)
          .sort(localeCompare),
        vscode.ConfigurationTarget.Global
      );

      void vscode.window.showInformationMessage(
        `Ignored "${currentColorTheme}"`
      );
    }),
    vscode.workspace.onDidChangeConfiguration(handleDidChangeConfiguration),
    vscode.extensions.onDidChange(() => {
      cache = getCache();
    })
  );
}

export function handleDidChangeConfiguration(
  event: vscode.ConfigurationChangeEvent
): void {
  if (
    event.affectsConfiguration("shifty.colorThemes") ||
    event.affectsConfiguration("shifty.shiftMode")
  ) {
    cache = getCache();
  }
}

export async function shiftColorTheme(): Promise<void> {
  await setColorTheme(nextColorTheme);
  nextColorTheme = getNextColorTheme(nextColorTheme);
}

export function getColorTheme(): string {
  return vscode.workspace.getConfiguration("workbench").colorTheme;
}

function getNextColorTheme(currentColorTheme?: string): string {
  const possibleColorThemes = cache.filter(
    (colorTheme) => colorTheme !== currentColorTheme ?? getColorTheme()
  );
  return getRandomItem(possibleColorThemes);
}

export async function setColorTheme(colorTheme: string): Promise<void> {
  const target = vscode.ConfigurationTarget.Global;
  const workbench = vscode.workspace.getConfiguration("workbench");
  const favorites = vscode.workspace
    .getConfiguration("shifty.colorThemes")
    .get<string[]>("favoriteColorThemes", []);

  await Promise.all([
    workbench.update("colorTheme", colorTheme, target),
    vscode.commands.executeCommand(
      "setContext",
      "shifty.isFavoriteColorTheme",
      favorites.includes(colorTheme)
    ),
  ]);
}

function getCache(): string[] {
  const {
    shiftMode,
    colorThemes: {
      favoriteColorThemes,
      ignoreColorThemes,
      ignoreDarkColorThemes,
      ignoreHighContrastColorThemes,
      ignoreLightColorThemes,
    },
  } = vscode.workspace.getConfiguration("shifty");

  const allColorThemes: ColorThemeWithMetadata[] = [];
  for (const extension of vscode.extensions.all) {
    const {
      packageJSON: { contributes: { themes = [] } = {} },
    } = extension;

    allColorThemes.push(
      ...themes.map(
        (theme: any): ColorThemeWithMetadata => ({
          name: theme.id || theme.label,
          type: theme.uiTheme,
        })
      )
    );
  }

  if (shiftMode === "favorites") {
    cacheWithMetadata = favoriteColorThemes
      .map((colorThemeName: string) =>
        allColorThemes.find((colorTheme) => colorTheme.name === colorThemeName)
      )
      .filter(Boolean)
      .filter(
        (colorTheme: ColorThemeWithMetadata) =>
          !(
            (ignoreHighContrastColorThemes && colorTheme.type === "hc-black") ||
            (ignoreLightColorThemes && colorTheme.type === "vs") ||
            (ignoreDarkColorThemes && colorTheme.type === "vs-dark")
          )
      );

    return cacheWithMetadata.map((colorTheme) => colorTheme.name);
  }

  cacheWithMetadata = allColorThemes.filter(
    (colorTheme) =>
      !(
        ignoreColorThemes.includes(colorTheme.name) ||
        (ignoreHighContrastColorThemes && colorTheme.type === "hc-black") ||
        (ignoreLightColorThemes && colorTheme.type === "vs") ||
        (ignoreDarkColorThemes && colorTheme.type === "vs-dark") ||
        (shiftMode === "discovery" &&
          favoriteColorThemes.includes(colorTheme.name))
      )
  );

  if (cacheWithMetadata.length === 0) {
    cacheWithMetadata = favoriteColorThemes
      .map((colorThemeName: string) =>
        allColorThemes.find((colorTheme) => colorTheme.name === colorThemeName)
      )
      .filter(Boolean)
      .filter(
        (colorTheme: ColorThemeWithMetadata) =>
          !(
            (ignoreHighContrastColorThemes && colorTheme.type === "hc-black") ||
            (ignoreLightColorThemes && colorTheme.type === "vs") ||
            (ignoreDarkColorThemes && colorTheme.type === "vs-dark")
          )
      );
  }

  if (cacheWithMetadata.length === 0) {
    cacheWithMetadata = [{ name: DEFAULT_COLOR_THEME, type: "vs-dark" }];
  }

  return cacheWithMetadata.map((colorTheme) => colorTheme.name);
}
