const vscode = require('vscode')
const getRandomItem = require('./utils/get-random-item')

const DARK_COLOR_THEME = 'vs-dark'
const LIGHT_COLOR_THEME = 'vs'
const HIGH_CONTRAST_COLOR_THEME = 'hc-black'
const DEFAULT_COLOR_THEME = 'Default Dark+'

module.exports = {
  _getColorThemesCache,
  activateColorThemes,
  maybeShiftColorThemeOnStartup,
  setRandomColorTheme,
  getColorThemes,
  getCurrentColorTheme,
  favoriteCurrentColorTheme,
  setColorTheme,
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
  await maybeShiftColorThemeOnStartup()

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'shifty.shiftColorTheme',
      setRandomColorTheme,
    ),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'shifty.favoriteCurrentColorTheme',
      favoriteCurrentColorTheme,
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
          [...new Set([...config.ignoreColorThemes, currentColorTheme])].sort(),
          true,
        )
        await config.update(
          'favoriteColorThemes',
          config.favoriteColorThemes
            .filter(ct => ct !== currentColorTheme)
            .sort(),
          true,
        )

        await setRandomColorTheme()
      },
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

async function maybeShiftColorThemeOnStartup() {
  const config = vscode.workspace.getConfiguration('shifty.startup')
  if (config.shiftColorThemeOnStartup) {
    await setRandomColorTheme()
  }
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

async function setRandomColorTheme() {
  const colorThemes = getColorThemes()
  const {id} = getRandomItem(colorThemes)
  await setColorTheme(id)
}

function getColorThemes() {
  if (colorThemesCache === null) {
    primeColorThemesCache()
  }

  const currentColorTheme = getCurrentColorTheme()
  return colorThemesCache.filter(ct => ct.id !== currentColorTheme)
}

function getCurrentColorTheme() {
  return vscode.workspace.getConfiguration('workbench').colorTheme
}

async function favoriteCurrentColorTheme() {
  const currentColorTheme = getCurrentColorTheme()

  const config = vscode.workspace.getConfiguration('shifty.colorThemes')
  await config.update(
    'favoriteColorThemes',
    [...new Set([...config.favoriteColorThemes, currentColorTheme])].sort(),
    true,
  )

  vscode.window.showInformationMessage(
    `Added "${currentColorTheme}" to favorites`,
  )
}

async function setColorTheme(colorTheme) {
  const workbench = vscode.workspace.getConfiguration('workbench')
  return workbench.update('colorTheme', colorTheme, true)
}
