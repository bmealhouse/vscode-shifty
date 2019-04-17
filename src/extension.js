const vscode = require('vscode')
const fontFamilies = require('./font-families')
const {
  CODEFACE,
  MAC_OS_ONLY,
  WINDOWS_ONLY,
} = require('./font-families/font-family-types')
const {activateColorThemes, setRandomColorTheme} = require('./color-themes')
const {activateShiftInterval, stopShiftInterval} = require('./shift-interval')
const getRandomItem = require('./utils/get-random-item')

module.exports = {
  activate,
  deactivate,
  initializeExtension,
  getFontFamilies,
  getCurrentFontFamily,
  setRandomFontFamily,
  setFontFamily,
  set,
}

let config = {}

async function activate(context) {
  console.log('activate')

  config = vscode.workspace.getConfiguration('shifty')

  vscode.extensions.onDidChange((...args) => {
    console.log('shifty:extension:onDidChange', args, JSON.stringify(args))
  })

  // vscode.workspace.onDidChangeConfiguration(event => {
  //   console.log('shifty:workspace:onDidChangeConfiguration')
  //   console.log(event.affectsConfiguration('shifty.fontFamily'))
  // })

  if (!config.enabled) {
    await deactivate()
    return
  }

  await initializeExtension(config)
  await activateColorThemes(context)
  activateShiftInterval(context)

  context.subscriptions.push(
    vscode.commands.registerCommand('shifty.shiftAll', async () => {
      await setRandomColorTheme(config)
      await setRandomFontFamily(config)
    }),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('shifty.shiftFontFamily', async () => {
      await setRandomFontFamily(config)
    }),
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
  if (config.startup.shiftFontFamilyOnStartup) {
    await setRandomFontFamily(config)
  }
}

function deactivate() {
  stopShiftInterval()
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
