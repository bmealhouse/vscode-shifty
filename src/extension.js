const vscode = require('vscode') // eslint-disable-line import/no-unresolved
const fontFamilies = require('./font-families')
const codefaceFontFamilies = require('./font-families/codeface-font-families')
const macosFontFamilies = require('./font-families/macos-font-families')
const windowsFontFamilies = require('./font-families/windows-font-families')

const DARK_COLOR_THEME = 'vs-dark'
const LIGHT_COLOR_THEME = 'vs'

let config = {}
let shiftColorThemeIntervalId = null
let shiftFontFamilyIntervalId = null

async function activate(context) {
  config = vscode.workspace.getConfiguration('shifty')

  if (!config.enabled) {
    await deactivate()
    return
  }

  await initializeExtension(config)

  context.subscriptions.push(
    vscode.commands.registerCommand('shifty.shiftAll', async () => {
      await setRandomColorTheme(config)
      await setRandomFontFamily(config)
    }),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('shifty.shiftColorTheme', async () => {
      await setRandomColorTheme(config)
    }),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('shifty.shiftFontFamily', async () => {
      await setRandomFontFamily(config)
    }),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('shifty.enableShiftInterval', async () => {
      if (config.shiftInterval.shiftColorThemeIntervalMs > 0) {
        shiftColorThemeIntervalId = setInterval(async () => {
          await setRandomColorTheme(config)
        }, config.shiftInterval.shiftColorThemeIntervalMs)
      }

      if (config.shiftInterval.shiftFontFamilyIntervalMs > 0) {
        shiftFontFamilyIntervalId = setInterval(async () => {
          await setRandomFontFamily(config)
        }, config.shiftInterval.shiftFontFamilyIntervalMs)
      }
    }),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('shifty.disableShiftInterval', async () => {
      if (shiftColorThemeIntervalId !== null) {
        clearInterval(shiftColorThemeIntervalId)
      }

      if (shiftFontFamilyIntervalId !== null) {
        clearInterval(shiftFontFamilyIntervalId)
      }
    }),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'shifty.ignoreCurrentColorTheme',
      async () => {
        const currentColorTheme = getCurrentColorTheme()

        await config.update(
          'colorThemes.ignoreColorThemes',
          [
            ...config.colorThemes.ignoreColorThemes.split(',').filter(Boolean),
            currentColorTheme,
          ].join(','),
          true,
        )

        config = vscode.workspace.getConfiguration('shifty')
        await setRandomColorTheme(config)
      },
    ),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'shifty.ignoreCurrentFontFamily',
      async () => {
        const currentFontFamily = getCurrentFontFamily()

        await config.update(
          'fontFamilies.ignoreFontFamilies',
          [
            ...config.fontFamilies.ignoreFontFamilies
              .split(',')
              .filter(Boolean),
            currentFontFamily,
          ].join(','),
          true,
        )

        config = vscode.workspace.getConfiguration('shifty')
        await setRandomFontFamily(config)
      },
    ),
  )
}

async function initializeExtension(config) {
  if (config.startup.shiftColorThemeOnStartup) {
    await setRandomColorTheme(config)
  }

  if (config.startup.shiftFontFamilyOnStartup) {
    await setRandomFontFamily(config)
  }
}

function deactivate() {
  if (shiftColorThemeIntervalId !== null) {
    clearInterval(shiftColorThemeIntervalId)
  }

  if (shiftFontFamilyIntervalId !== null) {
    clearInterval(shiftFontFamilyIntervalId)
  }
}

function getColorThemes(config) {
  const {
    colorThemes: {
      ignoreColorThemes,
      ignoreDarkColorThemes,
      ignoreLightColorThemes,
    },
  } = config

  const currentColorTheme = getCurrentColorTheme()

  return vscode.extensions.all
    .reduce((colorThemes, extension) => {
      if (!extension.packageJSON.contributes) return colorThemes
      if (!extension.packageJSON.contributes.themes) return colorThemes

      return [
        ...colorThemes,
        ...extension.packageJSON.contributes.themes.map(
          ({id, label, uiTheme}) => ({id: id || label, uiTheme}),
        ),
      ]
    }, [])
    .filter(
      ct =>
        !(
          ignoreColorThemes.split(',').includes(ct.id) ||
          (ignoreLightColorThemes && ct.uiTheme === LIGHT_COLOR_THEME) ||
          (ignoreDarkColorThemes && ct.uiTheme === DARK_COLOR_THEME) ||
          ct.id === currentColorTheme
        ),
    )
}

function getCurrentColorTheme() {
  return vscode.workspace.getConfiguration('workbench').colorTheme
}

async function setRandomColorTheme(config) {
  const colorThemes = getColorThemes(config)
  const {id: randomColorTheme} = getRandomItem(colorThemes)
  await setColorTheme(randomColorTheme)

  vscode.window.showInformationMessage(
    `Color theme shifted to "${randomColorTheme}".`,
  )
}

async function setColorTheme(colorTheme) {
  const workbench = vscode.workspace.getConfiguration('workbench')
  return workbench.update('colorTheme', colorTheme, true)
}

function getFontFamilies(config) {
  const {
    fontFamilies: {
      ignoreCodefaceFontFamilies,
      ignoreFontFamilies,
      ignoreMacosFontFamilies,
      ignoreWindowsFontFamilies,
      includeFontFamilies,
    },
  } = config

  const currentFontFamily = getCurrentFontFamily()

  return [
    ...fontFamilies.filter(
      ff =>
        !(
          ignoreFontFamilies.split(',').includes(ff) ||
          (ignoreCodefaceFontFamilies && codefaceFontFamilies.includes(ff)) ||
          (ignoreMacosFontFamilies && macosFontFamilies.includes(ff)) ||
          (ignoreWindowsFontFamilies && windowsFontFamilies.includes(ff)) ||
          ff === currentFontFamily
        ),
    ),
    ...includeFontFamilies.split(','),
  ].filter(Boolean)
}

function getCurrentFontFamily() {
  return vscode.workspace.getConfiguration('editor').fontFamily
}

async function setRandomFontFamily(config) {
  const fontFamilies = getFontFamilies(config)
  const randomFontFamily = getRandomItem(fontFamilies)
  await setFontFamily(randomFontFamily)

  vscode.window.showInformationMessage(
    `Font family shifted to "${randomFontFamily}".`,
  )
}

async function setFontFamily(fontFamily) {
  const editor = vscode.workspace.getConfiguration('editor')
  return editor.update('fontFamily', fontFamily, true)
}

async function set(config, section, value) {
  return config.update(section, value, true)
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

module.exports = {
  LIGHT_COLOR_THEME,
  DARK_COLOR_THEME,
  activate,
  deactivate,
  initializeExtension,
  getColorThemes,
  getCurrentColorTheme,
  setRandomColorTheme,
  setColorTheme,
  getFontFamilies,
  getCurrentFontFamily,
  setRandomFontFamily,
  setFontFamily,
  set,
}
