const os = require('os')
const vscode = require('vscode')
const getRandomItem = require('../utils/get-random-item')
const {CODEFACE, LINUX, MAC_OS, USER, WINDOWS} = require('./font-family-types')

const DEFAULT_FONT_FAMILY = 'Courier'

const allFontFamilies = [
  ...require('./codeface-font-families'),
  ...require('./system-font-families'),
  // 'AHAMONO',
]

module.exports = {
  activateFontFamilies,
  maybeShiftFontFamilyOnStartup,
  setRandomFontFamily,
  getFontFamilies,
  getCurrentFontFamily,
  favoriteCurrentFontFamily,
  setFontFamily,
  allFontFamilies,
  DEFAULT_FONT_FAMILY,
  __getFontFamiliesCache,
}

let fontFamiliesCache = null

async function activateFontFamilies(context) {
  primeFontFamiliesCache()
  await maybeShiftFontFamilyOnStartup()

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'shifty.shiftFontFamily',
      setRandomFontFamily,
    ),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'shifty.favoriteCurrentFontFamily',
      favoriteCurrentFontFamily,
    ),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'shifty.ignoreCurrentFontFamily',
      async () => {
        const currentFontFamily = getCurrentFontFamily()

        const config = vscode.workspace.getConfiguration('shifty.fontFamilies')
        await config.update(
          'ignoreFontFamilies',
          [
            ...new Set([...config.ignoreFontFamilies, currentFontFamily]),
          ].sort(),
          true,
        )
        await config.update(
          'favoriteFontFamilies',
          config.favoriteFontFamilies
            .filter(ff => ff !== currentFontFamily)
            .sort(),
          true,
        )

        await setRandomFontFamily()
      },
    ),
  )

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(event => {
      if (
        event.affectsConfiguration('shifty.fontFamilies') ||
        event.affectsConfiguration('shifty.shiftMode')
      ) {
        fontFamiliesCache = null
        primeFontFamiliesCache()
      }
    }),
  )
}

async function maybeShiftFontFamilyOnStartup() {
  const config = vscode.workspace.getConfiguration('shifty.startup')
  if (config.shiftFontFamilyOnStartup) {
    await setRandomFontFamily()
  }
}

function primeFontFamiliesCache() {
  if (fontFamiliesCache !== null) return

  const {
    shiftMode,
    fontFamilies: {
      favoriteFontFamilies,
      ignoreCodefaceFontFamilies,
      ignoreFontFamilies,
      includeFontFamilies,
    },
  } = vscode.workspace.getConfiguration('shifty')

  if (shiftMode === 'favorites') {
    fontFamiliesCache = favoriteFontFamilies
    return
  }

  fontFamiliesCache = [
    ...allFontFamilies.filter(
      ff =>
        !(
          ignoreFontFamilies.includes(ff.id) ||
          (ignoreCodefaceFontFamilies && ff.type === CODEFACE) ||
          (shiftMode === 'discovery' && favoriteFontFamilies.includes(ff.id)) ||
          !ff.supportedPlatforms.includes(os.type())
        ),
    ),
    ...includeFontFamilies.map(ff => ({
      id: ff,
      supportedPlatforms: [LINUX, MAC_OS, WINDOWS],
      type: USER,
    })),
  ]

  if (fontFamiliesCache.length === 0) {
    fontFamiliesCache = favoriteFontFamilies
  }

  if (fontFamiliesCache.length === 0) {
    fontFamiliesCache = [DEFAULT_FONT_FAMILY]
  }
}

async function setRandomFontFamily() {
  const fontFamilies = getFontFamilies()
  const {id} = getRandomItem(fontFamilies)
  await setFontFamily(id)
}

function getFontFamilies() {
  if (fontFamiliesCache !== null) {
    primeFontFamiliesCache()
  }

  const currentFontFamily = getCurrentFontFamily()
  return fontFamiliesCache.filter(ff => ff.id !== currentFontFamily)
}

function getCurrentFontFamily() {
  const {fontFamily} = vscode.workspace.getConfiguration('editor')
  const [editorFontFamily] = fontFamily.split(',')
  return editorFontFamily
}

async function favoriteCurrentFontFamily() {
  const currentFontFamily = getCurrentFontFamily()

  const config = vscode.workspace.getConfiguration('shifty.fontFamilies')
  await config.update(
    'favoriteFontFamilies',
    [...new Set([...config.favoriteFontFamilies, currentFontFamily])].sort(),
    true,
  )

  vscode.window.showInformationMessage(
    `Added "${currentFontFamily}" to favorites`,
  )
}

async function setFontFamily(fontFamily) {
  const {fallbackFontFamily} = vscode.workspace.getConfiguration(
    'shifty.fontFamilies',
  )

  const fontFamilyWithFallback = fallbackFontFamily
    ? `${fontFamily}, ${fallbackFontFamily}`
    : fontFamily

  return vscode.workspace
    .getConfiguration('editor')
    .update('fontFamily', fontFamilyWithFallback, true)
}

function __getFontFamiliesCache() {
  return fontFamiliesCache
}
