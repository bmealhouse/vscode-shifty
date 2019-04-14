const vscode = require('vscode') // eslint-disable-line import/no-unresolved
const fontFamilies = require('./font-families')
const {
  CODEFACE,
  MAC_OS_ONLY,
  WINDOWS_ONLY,
} = require('./font-families/font-family-types')
const {activateShiftInterval, stopShiftInterval} = require('./shift-interval')

const DARK_COLOR_THEME = 'vs-dark'
const LIGHT_COLOR_THEME = 'vs'

let config = {}

async function activate(context) {
  config = vscode.workspace.getConfiguration('shifty')

  // TODO: Handle extensions.onDidChange
  // TODO: Handle workspace.onDidChnageConfiguration

  if (!config.enabled) {
    await deactivate()
    return
  }

  await initializeExtension(config)
  activateShiftInterval(context)

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

exports.activate = activate

async function initializeExtension(config) {
  if (config.startup.shiftColorThemeOnStartup) {
    await setRandomColorTheme(config)
  }

  if (config.startup.shiftFontFamilyOnStartup) {
    await setRandomFontFamily(config)
  }
}

function deactivate() {
  stopShiftInterval()
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
  const {id} = getRandomItem(colorThemes)
  await setColorTheme(id)

  vscode.window.showInformationMessage(`Color theme shifted to "${id}".`)
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
          ignoreFontFamilies.split(',').includes(ff.id) ||
          (ignoreCodefaceFontFamilies && ff.types.includes(CODEFACE)) ||
          (ignoreMacosFontFamilies && ff.types.includes(MAC_OS_ONLY)) ||
          (ignoreWindowsFontFamilies && ff.types.includes(WINDOWS_ONLY)) ||
          ff.id === currentFontFamily
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
  const {id} = getRandomItem(fontFamilies)
  await setFontFamily(id)

  vscode.window.showInformationMessage(`Font family shifted to "${id}".`)
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
