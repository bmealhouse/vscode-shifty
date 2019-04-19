const vscode = require('vscode')
const getRandomItem = require('../utils/get-random-item')
const {CODEFACE, USER} = require('./types/font-families')
const {MAC_OS, WINDOWS} = require('./types/supported-platforms')

// TODO: provide documenation for font installation on MacOS & Windows
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
  setFontFamily,
  allFontFamilies,
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
      'shifty.ignoreCurrentFontFamily',
      async () => {
        const currentFontFamily = getCurrentFontFamily()

        const config = vscode.workspace.getConfiguration('shifty.fontFamilies')
        await config.update(
          'ignoreFontFamilies',
          [...new Set([...config.ignoreFontFamilies, currentFontFamily])],
          true,
        )

        await setRandomFontFamily()
      },
    ),
  )

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(event => {
      if (event.affectsConfiguration('shifty.fontFamilies')) {
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
    ignoreCodefaceFontFamilies,
    ignoreFontFamilies,
    ignoreMacosFontFamilies,
    ignoreWindowsFontFamilies,
    includeFontFamilies,
  } = vscode.workspace.getConfiguration('shifty.fontFamilies')

  fontFamiliesCache = [
    ...allFontFamilies.filter(
      ff =>
        !(
          ignoreFontFamilies.includes(ff.id) ||
          (ignoreCodefaceFontFamilies && ff.type === CODEFACE) ||
          (ignoreMacosFontFamilies && ff.supportedPlatforms.includes(MAC_OS)) ||
          (ignoreWindowsFontFamilies && ff.supportedPlatforms.includes(WINDOWS))
        ),
    ),
    ...includeFontFamilies.map(ff => ({
      id: ff,
      type: USER,
      supportedPlatforms: [MAC_OS, WINDOWS],
    })),
  ]
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
  return vscode.workspace.getConfiguration('editor').fontFamily
}

async function setFontFamily(fontFamily) {
  const editor = vscode.workspace.getConfiguration('editor')
  return editor.update('fontFamily', fontFamily, true)
}

function __getFontFamiliesCache() {
  return fontFamiliesCache
}
