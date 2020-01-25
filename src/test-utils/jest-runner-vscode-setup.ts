process.env.NODE_ENV = 'test'

jest.mock(
  'vscode',
  () => {
    const {vscode} = global as any

    vscode.workspace.getConfiguration = (section: string) => {
      let config: WorkspaceConfig = {...workspaceConfig}
      for (const sectionKey of section.split('.')) {
        config = config[sectionKey]
      }

      function get<T>(section: string, defaultValue: T): T
      function get<T>(section: string): T | undefined {
        return config[section]
      }

      return {
        ...config,
        get,
        update: update(section),
      }
    }

    return vscode
  },
  {virtual: true},
)

interface WorkspaceConfig {
  [name: string]: any
}

let workspaceConfig = defaultConfig()
afterEach(() => {
  workspaceConfig = defaultConfig()
})

function update(rootSection: string): (section: string, value: any) => void {
  return (section: string, value: any) => {
    let config: any = workspaceConfig
    for (const sectionKey of rootSection.split('.')) {
      config = config[sectionKey]
    }

    config[section] = value
  }
}

function defaultConfig(): WorkspaceConfig {
  return {
    editor: {
      fontFamily: '"Courier New", monospace',
    },
    workbench: {
      colorTheme: 'Default Dark+',
    },
    shifty: {
      shiftMode: 'default',
      colorThemes: {
        favoriteColorThemes: [],
        ignoreColorThemes: [],
        ignoreDarkColorThemes: false,
        ignoreHighContrastColorThemes: false,
        ignoreLightColorThemes: false,
      },
      fontFamilies: {
        fallbackFontFamily: 'monospace',
        favoriteFontFamilies: [],
        ignoreCodefaceFontFamilies: false,
        ignoreFontFamilies: [],
        includeFontFamilies: [],
      },
      shiftInterval: {
        automaticallyStartShiftInterval: true,
        shiftColorThemeIntervalMin: 30,
        shiftFontFamilyIntervalMin: 30,
      },
    },
  }
}
