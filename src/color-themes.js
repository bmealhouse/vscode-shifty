const vscode = require('vscode')
const getRandomItem = require('./utils/get-random-item')

const DARK_COLOR_THEME = 'vs-dark'
const LIGHT_COLOR_THEME = 'vs'
const HIGH_CONTRAST_COLOR_THEME = 'hc-black'
const DEFAULT_COLOR_THEME = 'Default Dark+'

module.exports = {
  _getColorThemesCache,
  activateColorThemes,
  shiftColorTheme,
  shiftColorThemeOnStartup,
  favoriteColorTheme,
  ignoreColorTheme,
  getColorTheme,
  setColorTheme,
  getAvailableColorThemes,
  DARK_COLOR_THEME,
  LIGHT_COLOR_THEME,
  HIGH_CONTRAST_COLOR_THEME,
  DEFAULT_COLOR_THEME,
}

let colorThemesCache = null
function _getColorThemesCache() {
  return colorThemesCache
}

async function activateColorThemes(context) {
  primeColorThemesCache()
  await shiftColorThemeOnStartup()

  context.subscriptions.push(
    vscode.commands.registerCommand('shifty.shiftColorTheme', shiftColorTheme),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'shifty.favoriteColorTheme',
      favoriteColorTheme,
    ),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'shifty.ignoreColorTheme',
      ignoreColorTheme,
    ),
  )

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(event => {
      if (
        event.affectsConfiguration('shifty.colorThemes') ||
        event.affectsConfiguration('shifty.shiftMode')
      ) {
        colorThemesCache = null
        primeColorThemesCache()
      }
    }),
  )

  context.subscriptions.push(
    vscode.extensions.onDidChange(() => {
      colorThemesCache = null
      primeColorThemesCache()
    }),
  )
}

async function shiftColorTheme() {
  const colorThemes = getAvailableColorThemes()
  const {id} = getRandomItem(colorThemes)
  await setColorTheme(id)
}

async function shiftColorThemeOnStartup() {
  const config = vscode.workspace.getConfiguration('shifty.startup')
  if (config.shiftColorThemeOnStartup) {
    await shiftColorTheme()
  }
}

async function favoriteColorTheme() {
  const colorTheme = getColorTheme()

  const config = vscode.workspace.getConfiguration('shifty.colorThemes')
  await config.update(
    'favoriteColorThemes',
    [...new Set([...config.favoriteColorThemes, colorTheme])].sort(),
    true,
  )

  vscode.window.showInformationMessage(`Added "${colorTheme}" to favorites`)
}

async function ignoreColorTheme() {
  const colorTheme = getColorTheme()

  const config = vscode.workspace.getConfiguration('shifty.colorThemes')
  await config.update(
    'ignoreColorThemes',
    [...new Set([...config.ignoreColorThemes, colorTheme])].sort(),
    true,
  )
  await config.update(
    'favoriteColorThemes',
    config.favoriteColorThemes.filter(ct => ct !== colorTheme).sort(),
    true,
  )

  vscode.window.showInformationMessage(`Ignored "${colorTheme}"`)
  await shiftColorTheme()
}

function getColorTheme() {
  return vscode.workspace.getConfiguration('workbench').colorTheme
}

async function setColorTheme(colorTheme) {
  const workbench = vscode.workspace.getConfiguration('workbench')
  return workbench.update('colorTheme', colorTheme, true)
}

function getAvailableColorThemes() {
  if (colorThemesCache === null) {
    primeColorThemesCache()
  }

  const colorTheme = getColorTheme()
  return colorThemesCache.filter(ct => ct.id !== colorTheme)
}

function primeColorThemesCache() {
  if (colorThemesCache !== null) return

  const {
    shiftMode,
    colorThemes: {
      favoriteColorThemes,
      ignoreColorThemes,
      ignoreDarkColorThemes,
      ignoreHighContrastColorThemes,
      ignoreLightColorThemes,
    },
  } = vscode.workspace.getConfiguration('shifty')

  if (shiftMode === 'favorites') {
    colorThemesCache = favoriteColorThemes
    return
  }

  colorThemesCache = vscode.extensions.all
    .reduce((colorThemes, extension) => {
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
    }, [])
    .filter(
      ct =>
        !(
          ignoreColorThemes.includes(ct.id) ||
          (ignoreHighContrastColorThemes &&
            ct.uiTheme === HIGH_CONTRAST_COLOR_THEME) ||
          (ignoreLightColorThemes && ct.uiTheme === LIGHT_COLOR_THEME) ||
          (ignoreDarkColorThemes && ct.uiTheme === DARK_COLOR_THEME) ||
          (shiftMode === 'discovery' && favoriteColorThemes.includes(ct.id))
        ),
    )

  if (colorThemesCache.length === 0) {
    colorThemesCache = favoriteColorThemes
  }

  if (colorThemesCache.length === 0) {
    colorThemesCache = [DEFAULT_COLOR_THEME]
  }
}
