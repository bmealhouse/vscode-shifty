import vscode from "vscode";

let rootConfig = getWorkspaceConfig();

export const resetVscodeConfig = () => {
  rootConfig = getWorkspaceConfig();
};

vscode.workspace.getConfiguration = (
  section?: string,
  scope?: vscode.ConfigurationScope | null
): vscode.WorkspaceConfiguration => {
  let config = rootConfig;
  for (const sectionKey of section?.split(".") ?? []) {
    config = config[sectionKey];
  }

  function get<T>(section: string): T | undefined;
  function get<T>(section: string, defaultValue?: T): T {
    return config[section] || defaultValue;
  }

  function has(section: string): boolean {
    return config[section] !== undefined;
  }

  function inspect<T>(section: string): undefined {
    return undefined;
  }

  async function update(
    section: string,
    value: any,
    configurationTarget?: vscode.ConfigurationTarget | boolean,
    overrideInLanguage?: boolean
  ): Promise<void> {
    let nestedConfig = config;

    if (section.includes(".")) {
      for (const sectionKey of section.split(".")) {
        nestedConfig = nestedConfig[sectionKey];
      }
    }

    nestedConfig[section] = value;
  }

  return {
    ...config,
    get,
    has,
    inspect,
    update,
  };
};

function getWorkspaceConfig(): Record<string, any> {
  return {
    editor: {
      fontFamily: '"Courier New", monospace',
    },
    workbench: {
      colorTheme: "Default Dark+",
    },
    shifty: {
      shiftMode: "default",
      colorThemes: {
        favoriteColorThemes: [],
        ignoreColorThemes: [],
        ignoreDarkColorThemes: false,
        ignoreHighContrastColorThemes: false,
        ignoreLightColorThemes: false,
      },
      fontFamilies: {
        fallbackFontFamily: "monospace",
        favoriteFontFamilies: [],
        ignoreFontFamilies: [],
        includeFontFamilies: [],
      },
      shiftInterval: {
        automaticallyStartShiftInterval: true,
        shiftColorThemeIntervalMin: 30,
        shiftFontFamilyIntervalMin: 30,
      },
    },
  };
}
