const os = require('os')
const vscode = require('vscode')
const getRandomItem = require('../utils/get-random-item')
const {CODEFACE, LINUX, MAC_OS, USER, WINDOWS} = require('./font-family-types')

const DEFAULT_FONT_FAMILY = 'Courier New'

const allFontFamilies = [
  ...require('./codeface-font-families'),
  ...require('./system-font-families'),
  // 'AHAMONO',
]

module.exports = {
  _getFontFamiliesCache,
  activateFontFamilies,
  shiftFontFamily,
  shiftFontFamilyOnStartup,
  favoriteFontFamily,
  ignoreFontFamily,
  getFontFamily,
  setFontFamily,
  allFontFamilies,
  getAvailableFontFamilies,
  DEFAULT_FONT_FAMILY,
}

let fontFamiliesCache = null
function _getFontFamiliesCache() {
  return fontFamiliesCache
}

async function activateFontFamilies(context) {
  primeFontFamiliesCache()
  await shiftFontFamilyOnStartup()

  context.subscriptions.push(
    vscode.commands.registerCommand('shifty.shiftFontFamily', shiftFontFamily),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'shifty.favoriteFontFamily',
      favoriteFontFamily,
    ),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'shifty.ignoreFontFamily',
      ignoreFontFamily,
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

async function shiftFontFamily() {
  const fontFamilies = getAvailableFontFamilies()
  const {id} = getRandomItem(fontFamilies)
  await setFontFamily(id)
}

async function shiftFontFamilyOnStartup() {
  const config = vscode.workspace.getConfiguration('shifty.startup')
  if (config.shiftFontFamilyOnStartup) {
    await shiftFontFamily()
  }
}

async function favoriteFontFamily() {
  const fontFamily = getFontFamily()

  const config = vscode.workspace.getConfiguration('shifty.fontFamilies')
  await config.update(
    'favoriteFontFamilies',
    [...new Set([...config.favoriteFontFamilies, fontFamily])].sort(),
    true,
  )

  vscode.window.showInformationMessage(`Added "${fontFamily}" to favorites`)
}

async function ignoreFontFamily() {
  const fontFamily = getFontFamily()

  const config = vscode.workspace.getConfiguration('shifty.fontFamilies')
  await config.update(
    'ignoreFontFamilies',
    [...new Set([...config.ignoreFontFamilies, fontFamily])].sort(),
    true,
  )
  await config.update(
    'favoriteFontFamilies',
    config.favoriteFontFamilies.filter(ff => ff !== fontFamily).sort(),
    true,
  )

  vscode.window.showInformationMessage(`Ignored "${fontFamily}"`)
  await shiftFontFamily()
}

function getFontFamily() {
  const {fontFamily} = vscode.workspace.getConfiguration('editor')
  const [primaryFontFamily] = fontFamily.split(',')
  return primaryFontFamily.replace(/"/g, '')
}

async function setFontFamily(fontFamily) {
  const {fallbackFontFamily} = vscode.workspace.getConfiguration(
    'shifty.fontFamilies',
  )

  const formattedFontFamily = /\s/.test(fontFamily)
    ? `"${fontFamily}"`
    : fontFamily

  const fontFamilyWithFallback = fallbackFontFamily
    ? `${formattedFontFamily}, ${fallbackFontFamily}`
    : fontFamily

  return vscode.workspace
    .getConfiguration('editor')
    .update('fontFamily', fontFamilyWithFallback, true)
}

function getAvailableFontFamilies() {
  if (fontFamiliesCache === null) {
    primeFontFamiliesCache()
  }

  const fontFamily = getFontFamily()
  return fontFamiliesCache.filter(ff => ff.id !== fontFamily)
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
