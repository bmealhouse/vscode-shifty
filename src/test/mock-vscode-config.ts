import vscode from "vscode";

let rootConfig = getWorkspaceConfig();

export function resetVscodeConfig() {
  rootConfig = getWorkspaceConfig();
}

vscode.workspace.getConfiguration = (
  section?: string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  scope?: vscode.ConfigurationScope | null,
): vscode.WorkspaceConfiguration => {
  let config: Record<string, unknown> = rootConfig;
  for (const sectionKey of section?.split(".") ?? []) {
    config = config[sectionKey] as Record<string, unknown>;
  }

  function get<T>(section: string): T | undefined;
  function get<T>(section: string, defaultValue?: T): T {
    return (config[section] || defaultValue) as T;
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
    overrideInLanguage?: boolean,
  ): Promise<void> {
    let nestedConfig = config;

    if (section.includes(".")) {
      for (const sectionKey of section.split(".")) {
        nestedConfig = nestedConfig[sectionKey] as Record<string, unknown>;
      }
    }

    nestedConfig[section] = value as unknown;
  }

  return {
    // ...confg,
    get,
    has,
    inspect,
    update,
  };
};

function getWorkspaceConfig() {
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
        type: "dark",
        favoriteColorThemes: [],
        ignoreColorThemes: [],
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
