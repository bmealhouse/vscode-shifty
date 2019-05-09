const os = require('os')
const vscode = require('vscode')
const sinon = require('sinon')
const {
  getColorTheme,
  setColorTheme,
  DEFAULT_COLOR_THEME,
} = require('../src/color-themes')
const {
  getFontFamily,
  setFontFamily,
  DEFAULT_FONT_FAMILY,
} = require('../src/font-families')
const {MAC_OS} = require('../src/font-families/font-family-types')

const DEFAULT_PLATFORM = MAC_OS

module.exports = {
  setupTest,
  teardownTest,
  getConfig,
  setConfig,
  wait,
  DEFAULT_PLATFORM,
}

let originalConfig = {}
let originalColorTheme = null
let originalFontFamily = null

async function setupTest() {
  sinon.stub(os, 'type').returns(DEFAULT_PLATFORM)
  sinon.spy(vscode.window, 'showInformationMessage')

  originalColorTheme = getColorTheme()
  await setColorTheme(DEFAULT_COLOR_THEME)

  originalFontFamily = getFontFamily()
  await setFontFamily(DEFAULT_FONT_FAMILY)

  await setDefault('shifty.shiftMode', 'all')
  await setDefault('shifty.colorThemes.favoriteColorThemes', [])
  await setDefault('shifty.colorThemes.ignoreColorThemes', [])
  await setDefault('shifty.colorThemes.ignoreDarkColorThemes', false)
  await setDefault('shifty.colorThemes.ignoreHighContrastColorThemes', false)
  await setDefault('shifty.colorThemes.ignoreLightColorThemes', false)
  await setDefault('shifty.fontFamilies.fallbackFontFamily', 'monospace')
  await setDefault('shifty.fontFamilies.favoriteFontFamilies', [])
  await setDefault('shifty.fontFamilies.ignoreCodefaceFontFamilies', false)
  await setDefault('shifty.fontFamilies.ignoreFontFamilies', [])
  await setDefault('shifty.fontFamilies.includeFontFamilies', [])
  await setDefault('shifty.shiftInterval.shiftColorThemeIntervalMs', 1800000)
  await setDefault('shifty.shiftInterval.shiftFontFamilyIntervalMs', 1800000)
  await setDefault('shifty.startup.shiftColorThemeOnStartup', false)
  await setDefault('shifty.startup.shiftFontFamilyOnStartup', false)
}

async function teardownTest() {
  os.type.restore()
  vscode.window.showInformationMessage.restore()

  if (originalColorTheme) {
    await setColorTheme(originalColorTheme)
    originalColorTheme = null
  }

  if (originalFontFamily) {
    await setFontFamily(originalFontFamily)
    originalFontFamily = null
  }

  // restore original config
  await restoreOriginal('shifty.shiftMode')
  await restoreOriginal('shifty.colorThemes.favoriteColorThemes')
  await restoreOriginal('shifty.colorThemes.ignoreColorThemes')
  await restoreOriginal('shifty.colorThemes.ignoreDarkColorThemes')
  await restoreOriginal('shifty.colorThemes.ignoreHighContrastColorThemes')
  await restoreOriginal('shifty.colorThemes.ignoreLightColorThemes')
  await restoreOriginal('shifty.fontFamilies.fallbackFontFamily')
  await restoreOriginal('shifty.fontFamilies.favoriteFontFamilies')
  await restoreOriginal('shifty.fontFamilies.ignoreCodefaceFontFamilies')
  await restoreOriginal('shifty.fontFamilies.ignoreFontFamilies')
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
