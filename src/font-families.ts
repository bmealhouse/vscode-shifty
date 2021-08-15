import vscode from "vscode";
import { getMonospaceFonts } from "node-monospace-fonts";

import { commandMap, DEFAULT_FONT_FAMILY } from "./constants";
import { getRandomItem, localeCompare, unique } from "./utils";

let cache: string[];
let nextFontFamily: string;

export const getRawCache = () => cache;

export function activateFontFamilies(context: vscode.ExtensionContext): void {
  cache = getCache();
  nextFontFamily = getNextFontFamily();

  context.subscriptions.push(
    vscode.commands.registerCommand(commandMap.SHIFT_FONT_FAMILY, async () => {
      await shiftFontFamily();
      await vscode.commands.executeCommand(commandMap.RESTART_SHIFT_INTERVAL);
    }),
    vscode.commands.registerCommand(
      commandMap.TOGGLE_FAVORITE_FONT_FAMILY,
      async () => {
        const currentFontFamily = getFontFamily();
        const config = vscode.workspace.getConfiguration("shifty.fontFamilies");
        const favorites = config.get<string[]>("favoriteFontFamilies", []);

        if (favorites.includes(currentFontFamily)) {
          await config.update(
            "favoriteFontFamilies",
            unique(
              favorites.filter((fontFamily) => fontFamily !== currentFontFamily)
            ).sort(localeCompare),
            vscode.ConfigurationTarget.Global
          );
          void vscode.window.showInformationMessage(
            `Removed "${currentFontFamily}" from favorites`
          );
        } else {
          await config.update(
            "favoriteFontFamilies",
            unique([...favorites, currentFontFamily]).sort(localeCompare),
            vscode.ConfigurationTarget.Global
          );
          void vscode.window.showInformationMessage(
            `Added "${currentFontFamily}" to favorites`
          );
        }
      }
    ),
    vscode.commands.registerCommand(commandMap.IGNORE_FONT_FAMILY, async () => {
      const currentFontFamily = getFontFamily();

      await shiftFontFamily();
      await vscode.commands.executeCommand(commandMap.RESTART_SHIFT_INTERVAL);

      const config = vscode.workspace.getConfiguration("shifty.fontFamilies");
      const ignoreFontFamilies = config.get<string[]>("ignoreFontFamilies", []);
      const favoriteFontFamilies = config.get<string[]>(
        "favoriteFontFamilies",
        []
      );

      await config.update(
        "ignoreFontFamilies",
        unique([...ignoreFontFamilies, currentFontFamily]).sort(localeCompare),
        vscode.ConfigurationTarget.Global
      );

      await config.update(
        "favoriteFontFamilies",
        favoriteFontFamilies
          .filter((fontFamily) => fontFamily !== currentFontFamily)
          .sort(localeCompare),
        vscode.ConfigurationTarget.Global
      );

      void vscode.window.showInformationMessage(
        `Ignored "${currentFontFamily}"`
      );
    }),
    vscode.workspace.onDidChangeConfiguration(handleDidChangeConfiguration)
  );
}

export function handleDidChangeConfiguration(
  event: vscode.ConfigurationChangeEvent
): void {
  if (
    event.affectsConfiguration("shifty.fontFamilies") ||
    event.affectsConfiguration("shifty.shiftMode")
  ) {
    cache = getCache();
  }
}

export async function shiftFontFamily(): Promise<void> {
  await setFontFamily(nextFontFamily);
  nextFontFamily = getNextFontFamily(nextFontFamily);
}

export function getFontFamily(): string {
  const { fontFamily } = vscode.workspace.getConfiguration("editor");
  const [mainFontFamily] = fontFamily.split(",");
  return mainFontFamily.replace(/"/g, "");
}

function getNextFontFamily(currentFontFamily?: string): string {
  const possibleFontFamilies = cache.filter(
    (fontFamily) => fontFamily !== currentFontFamily ?? getFontFamily()
  );
  return getRandomItem(possibleFontFamilies);
}

export async function setFontFamily(fontFamily: string): Promise<void> {
  const fallbackFontFamily = vscode.workspace
    .getConfiguration("shifty.fontFamilies")
    .get<string>("fallbackFontFamily", "");

  const formattedFontFamily = /\s/.test(fontFamily)
    ? `"${fontFamily}"`
    : fontFamily;

  const fontFamilyWithFallback = `${formattedFontFamily}, ${fallbackFontFamily}`;

  const editor = vscode.workspace.getConfiguration("editor");
  await editor.update(
    "fontFamily",
    fallbackFontFamily ? fontFamilyWithFallback : fontFamily,
    vscode.ConfigurationTarget.Global
  );
}

function getCache(): string[] {
  const {
    shiftMode,
    fontFamilies: {
      favoriteFontFamilies,
      ignoreFontFamilies,
      includeFontFamilies,
    },
  } = vscode.workspace.getConfiguration("shifty");

  const allFontFamilies: string[] = [
    ...getMonospaceFonts(),
    ...includeFontFamilies,
  ];

  if (shiftMode === "favorites") {
    return allFontFamilies.filter((fontFamily) =>
      favoriteFontFamilies.includes(fontFamily)
    );
  }

  let fontFamiliesCache = allFontFamilies.filter(
    (fontFamily) =>
      !(
        ignoreFontFamilies.includes(fontFamily) ||
        (shiftMode === "discovery" && favoriteFontFamilies.includes(fontFamily))
      )
  );

  if (fontFamiliesCache.length === 0) {
    fontFamiliesCache = allFontFamilies.filter((fontFamily) =>
      favoriteFontFamilies.includes(fontFamily)
    );
  }

  if (fontFamiliesCache.length === 0) {
    fontFamiliesCache = [DEFAULT_FONT_FAMILY];
  }

  return fontFamiliesCache;
}
