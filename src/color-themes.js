const vscode = require('vscode')
const getRandomItem = require('./utils/get-random-item')

const DARK_COLOR_THEME = 'vs-dark'
const LIGHT_COLOR_THEME = 'vs'
const HIGH_CONTRAST_COLOR_THEME = 'hc-black'

module.exports = {
  activateColorThemes,
  maybeShiftColorThemeOnStartup,
  setRandomColorTheme,
  getColorThemes,
  getCurrentColorTheme,
  setColorTheme,
  DARK_COLOR_THEME,
  LIGHT_COLOR_THEME,
  HIGH_CONTRAST_COLOR_THEME,
  __getColorThemesCache,
}

let colorThemesCache = null

async function activateColorThemes(context) {
  primeColorThemeCache()
  await maybeShiftColorThemeOnStartup()

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'shifty.shiftColorTheme',
      setRandomColorTheme,
    ),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'shifty.ignoreCurrentColorTheme',
      async () => {
        const currentColorTheme = getCurrentColorTheme()

        const config = vscode.workspace.getConfiguration('shifty.colorThemes')
        await config.update(
          'ignoreColorThemes',
          [...new Set([...config.ignoreColorThemes, currentColorTheme])],
          true,
        )

        await setRandomColorTheme()
      },
    ),
  )

  vscode.workspace.onDidChangeConfiguration(event => {
    if (event.affectsConfiguration('shifty.colorThemes')) {
      colorThemesCache = null
      primeColorThemeCache()
    }
  })
}

async function maybeShiftColorThemeOnStartup() {
  const config = vscode.workspace.getConfiguration('shifty.startup')
  if (config.shiftColorThemeOnStartup) {
    await setRandomColorTheme()
  }
}

function primeColorThemeCache() {
  if (colorThemesCache !== null) return

  const {
    ignoreColorThemes,
    ignoreDarkColorThemes,
    ignoreHighContrastColorThemes,
    ignoreLightColorThemes,
  } = vscode.workspace.getConfiguration('shifty.colorThemes')

  colorThemesCache = vscode.extensions.all
    .reduce(normalizeColorThemesExtensions, [])
    .filter(
      ct =>
        !(
          ignoreColorThemes.includes(ct.id) ||
          (ignoreHighContrastColorThemes &&
            ct.uiTheme === HIGH_CONTRAST_COLOR_THEME) ||
          (ignoreLightColorThemes && ct.uiTheme === LIGHT_COLOR_THEME) ||
          (ignoreDarkColorThemes && ct.uiTheme === DARK_COLOR_THEME)
        ),
    )
}

function normalizeColorThemesExtensions(colorThemes, extension) {
  const {
    packageJSON: {contributes: {themes} = {}},
  } = extension

  if (!themes) {
    return colorThemes
  }

  return [
    ...colorThemes,
    ...themes.map(({id, label, uiTheme}) => ({
      id: id || label,
      uiTheme,
    })),
  ]
}

async function setRandomColorTheme() {
  const colorThemes = getColorThemes()
  const {id} = getRandomItem(colorThemes)
  await setColorTheme(id)

  vscode.window.showInformationMessage(`Color theme shifted to "${id}".`)
}

function getColorThemes() {
  if (colorThemesCache !== null) {
    primeColorThemeCache()
  }

  const currentColorTheme = getCurrentColorTheme()
  return colorThemesCache.filter(ct => ct.id !== currentColorTheme)
}

function getCurrentColorTheme() {
  return vscode.workspace.getConfiguration('workbench').colorTheme
}

async function setColorTheme(colorTheme) {
  const workbench = vscode.workspace.getConfiguration('workbench')
  return workbench.update('colorTheme', colorTheme, true)
}

function __getColorThemesCache() {
  return colorThemesCache
}
