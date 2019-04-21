const vscode = require('vscode')
const {getCurrentColorTheme, setColorTheme} = require('../src/color-themes')
const {getCurrentFontFamily, setFontFamily} = require('../src/font-families')

const DEFAULT_COLOR_THEME = 'Visual Studio Dark'
const DEFAULT_FONT_FAMILY = 'Monaco'

module.exports = {
  setupTest,
  teardownTest,
  getConfig,
  setConfig,
  wait,
  DEFAULT_COLOR_THEME,
  DEFAULT_FONT_FAMILY,
}

let originalConfig = {}
let originalColorTheme = null
let originalFontFamily = null

async function setupTest() {
  originalColorTheme = getCurrentColorTheme()
  await setColorTheme(DEFAULT_COLOR_THEME)

  originalFontFamily = getCurrentFontFamily()
  await setFontFamily(DEFAULT_FONT_FAMILY)

  await setDefault('shifty.colorThemes.ignoreColorThemes', [])
  await setDefault('shifty.colorThemes.ignoreDarkColorThemes', false)
  await setDefault('shifty.colorThemes.ignoreHighContrastColorThemes', false)
  await setDefault('shifty.colorThemes.ignoreLightColorThemes', false)
  await setDefault('shifty.fontFamilies.ignoreCodefaceFontFamilies', false)
  await setDefault('shifty.fontFamilies.ignoreFontFamilies', [])
  await setDefault('shifty.fontFamilies.ignoreMacosFontFamilies', false)
  await setDefault('shifty.fontFamilies.ignoreWindowsFontFamilies', false)
  await setDefault('shifty.fontFamilies.includeFontFamilies', [])
  await setDefault('shifty.shiftInterval.shiftColorThemeIntervalMs', 1800000)
  await setDefault('shifty.shiftInterval.shiftFontFamilyIntervalMs', 1800000)
  await setDefault('shifty.startup.shiftColorThemeOnStartup', false)
  await setDefault('shifty.startup.shiftFontFamilyOnStartup', false)
}

async function teardownTest() {
  if (originalColorTheme) {
    await setColorTheme(originalColorTheme)
    originalColorTheme = null
  }

  if (originalFontFamily) {
    await setFontFamily(originalFontFamily)
    originalFontFamily = null
  }

  // restore original config
  await restoreOriginal('shifty.colorThemes.ignoreColorThemes')
  await restoreOriginal('shifty.colorThemes.ignoreDarkColorThemes')
  await restoreOriginal('shifty.colorThemes.ignoreHighContrastColorThemes')
  await restoreOriginal('shifty.colorThemes.ignoreLightColorThemes')
  await restoreOriginal('shifty.fontFamilies.ignoreCodefaceFontFamilies')
  await restoreOriginal('shifty.fontFamilies.ignoreFontFamilies')
  await restoreOriginal('shifty.fontFamilies.ignoreMacosFontFamilies')
  await restoreOriginal('shifty.fontFamilies.ignoreWindowsFontFamilies')
  await restoreOriginal('shifty.fontFamilies.includeFontFamilies')
  await restoreOriginal('shifty.shiftInterval.shiftColorThemeIntervalMs')
  await restoreOriginal('shifty.shiftInterval.shiftFontFamilyIntervalMs')
  await restoreOriginal('shifty.startup.shiftColorThemeOnStartup')
  await restoreOriginal('shifty.startup.shiftFontFamilyOnStartup')
  originalConfig = {}
}

async function setDefault(keyPath, defaultValue) {
  const currentValue = await getConfig(keyPath)
  originalConfig[keyPath] = currentValue

  if (Array.isArray(defaultValue)) {
    if (currentValue.length === 0) return
  } else if (currentValue === defaultValue) {
    return
  }

  await setConfig(keyPath, defaultValue)
}

async function restoreOriginal(keyPath) {
  const currentValue = getConfig(keyPath)
  const originalValue = originalConfig[keyPath]

  if (Array.isArray(currentValue)) {
    if (currentValue.length === 0 && originalValue.length === 0) return
  } else if (currentValue === originalValue) {
    return
  }

  await setConfig(keyPath, originalValue)
}

function getConfig(keyPath) {
  const [key, ...sections] = keyPath.split('.').reverse()
  const config = vscode.workspace.getConfiguration(sections.reverse().join('.'))
  return config[key]
}

async function setConfig(keyPath, value) {
  const [key, ...sections] = keyPath.split('.').reverse()
  const config = vscode.workspace.getConfiguration(sections.reverse().join('.'))
  return config.update(key, value, true)
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
