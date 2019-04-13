const assert = require('assert')
const shifty = require('../src/extension')
const allFontFamilies = require('../src/font-families')
const {
  CODEFACE,
  MAC_OS_ONLY,
  WINDOWS_ONLY,
} = require('../src/font-families/font-family-types')
// const codefaceFontFamilies = require('../src/font-families/codeface-font-families')
// const macosFontFamilies = require('../src/font-families/macos-font-families')
// const windowsFontFamilies = require('../src/font-families/windows-font-families')

const {DARK_COLOR_THEME, LIGHT_COLOR_THEME} = shifty

let originalColorTheme = null
let originalFontFamily = null

setup(async () => {
  originalColorTheme = shifty.getCurrentColorTheme()
  await shifty.setColorTheme('Visual Studio Dark')

  originalFontFamily = shifty.getCurrentFontFamily()
  await shifty.setFontFamily('Monaco')
})

teardown(async () => {
  shifty.deactivate()

  if (originalColorTheme) {
    await shifty.setColorTheme(originalColorTheme)
  }

  if (originalColorTheme) {
    await shifty.setFontFamily(originalFontFamily)
  }
})

const getShiftyConfig = config => ({
  enabled: true,
  colorThemes: {
    ignoreColorThemes: 'Default High Contrast',
    ignoreDarkColorThemes: false,
    ignoreLightColorThemes: false,
    ...config.colorThemes,
  },
  fontFamilies: {
    ignoreCodefaceFontFamilies: false,
    ignoreFontFamilies: '',
    ignoreMacosFontFamilies: false,
    ignoreWindowsFontFamilies: false,
    includeFontFamilies: '',
    ...config.fontFamilies,
  },
  shiftInterval: {
    enabled: false,
    shiftColorThemeIntervalMs: 0,
    shiftFontFamilyIntervalMs: 0,
    ...config.shiftInterval,
  },
  startup: {
    shiftColorThemeOnStartup: false,
    shiftFontFamilyOnStartup: false,
    ...config.startup,
  },
})

// suite('shifty', function() {
//   test('should shift color theme on startup', async () => {
//     const config = getShiftyConfig({
//       startup: {
//         shiftColorThemeOnStartup: true,
//       },
//     })

//     const currentColorTheme = shifty.getCurrentColorTheme()
//     await shifty.initializeExtension(config)
//     const nextColorTheme = shifty.getCurrentColorTheme()

//     assert.strict.notEqual(nextColorTheme, currentColorTheme)
//   })

//   test('should not shift color theme on startup when disabled', async () => {
//     const config = getShiftyConfig({
//       startup: {
//         shiftColorThemeOnStartup: false,
//       },
//     })

//     const currentColorTheme = shifty.getCurrentColorTheme()
//     await shifty.initializeExtension(config)
//     const nextColorTheme = shifty.getCurrentColorTheme()

//     assert.equal(nextColorTheme, currentColorTheme)
//   })

//   test('should shift font family on startup', async () => {
//     const config = getShiftyConfig({
//       startup: {
//         shiftFontFamilyOnStartup: true,
//       },
//     })

//     const currentFontFamily = shifty.getCurrentFontFamily()
//     await shifty.initializeExtension(config)
//     const nextFontFamily = shifty.getCurrentFontFamily()

//     assert.notEqual(nextFontFamily, currentFontFamily)
//   })

//   test('should not shift font family on startup when disabled', async () => {
//     const config = getShiftyConfig({
//       startup: {
//         shiftFontFamilyOnStartup: false,
//       },
//     })

//     const currentFontFamily = shifty.getCurrentFontFamily()
//     await shifty.initializeExtension(config)
//     const nextFontFamily = shifty.getCurrentFontFamily()

//     assert.equal(nextFontFamily, currentFontFamily)
//   })

//   test('should shift color theme using an 25ms interval', function(done) {
//     this.timeout(250)

//     const config = getShiftyConfig({
//       shiftInterval: {
//         enabled: true,
//         shiftColorThemeIntervalMs: 10,
//       },
//     })

//     const currentColorTheme = shifty.getCurrentColorTheme()

//     shifty.initializeExtension(config).then(() => {
//       function waitForColorThemeToShift() {
//         if (currentColorTheme !== shifty.getCurrentColorTheme()) {
//           done()
//         } else {
//           setTimeout(waitForColorThemeToShift, 10)
//         }
//       }
//       waitForColorThemeToShift()
//     })
//   })

//   test('should not shift color theme using an interval when disabled', function(done) {
//     this.timeout(250)

//     const config = getShiftyConfig({
//       shiftInterval: {
//         enabled: false,
//         shiftColorThemeIntervalMs: 10,
//       },
//     })

//     const currentColorTheme = shifty.getCurrentColorTheme()

//     shifty.initializeExtension(config).then(() => {
//       function waitForColorThemeToShift() {
//         if (currentColorTheme !== shifty.getCurrentColorTheme()) {
//           assert.fail()
//         } else {
//           setTimeout(waitForColorThemeToShift, 10)
//         }
//       }
//       waitForColorThemeToShift()
//     })
//   })

//   test('should shift font family using an 100ms interval')

//   test('should not shift font family using an interval when disabled')
// })

suite('getColorThemes', () => {
  test('should return all color themes', () => {
    const config = getShiftyConfig({})

    const DEFAULT_VSCODE_THEMES = 13
    const colorThemes = shifty.getColorThemes(config)

    assert.strictEqual(colorThemes.length, DEFAULT_VSCODE_THEMES - 1)
  })

  test('should return all color themes except the current color theme', async () => {
    const config = getShiftyConfig({})

    const colorTheme = 'Visual Studio Dark'
    await shifty.setColorTheme(colorTheme)
    const colorThemes = shifty.getColorThemes(config)

    assert.strictEqual(colorThemes.find(ct => ct.id === colorTheme), undefined)
  })

  test('should return all color themes except the ignored color themes', () => {
    const defaultHighContrast = 'Default High Contrast'
    const visualStudioDark = 'Visual Studio Dark'

    const config = getShiftyConfig({
      colorThemes: {
        ignoreColorThemes: `${defaultHighContrast},${visualStudioDark}`,
      },
    })

    const colorThemes = shifty.getColorThemes(config)

    assert.strictEqual(
      colorThemes.find(ct => ct.id === defaultHighContrast),
      undefined,
    )
    assert.strictEqual(
      colorThemes.find(ct => ct.id === visualStudioDark),
      undefined,
    )
  })

  test('should return no light themes when ignored', () => {
    const config = getShiftyConfig({
      colorThemes: {
        ignoreLightColorThemes: true,
      },
    })

    const colorThemes = shifty.getColorThemes(config)

    assert.strictEqual(
      colorThemes.every(ct => ct.uiTheme !== LIGHT_COLOR_THEME),
      true,
    )
  })

  test('should return no dark themes when ignored', () => {
    const config = getShiftyConfig({
      colorThemes: {
        ignoreDarkColorThemes: true,
      },
    })

    const colorThemes = shifty.getColorThemes(config)
    assert.strictEqual(
      colorThemes.every(ct => ct.uiTheme !== DARK_COLOR_THEME),
      true,
    )
  })

  test('should return no themes when light & dark themes are ignored', () => {
    const config = getShiftyConfig({
      colorThemes: {
        ignoreDarkColorThemes: true,
        ignoreLightColorThemes: true,
      },
    })

    const colorThemes = shifty.getColorThemes(config)
    assert.strictEqual(colorThemes.length, 0)
  })
})

suite('getFontFamilies', () => {
  test('should return all font families', () => {
    const config = getShiftyConfig({})
    const fontFamilies = shifty.getFontFamilies(config)
    assert.strictEqual(fontFamilies.length, allFontFamilies.length - 1)
  })

  test('should return all font families except the current font family', async () => {
    const config = getShiftyConfig({})

    const expectedFontFamily = 'Monaco'
    await shifty.setFontFamily(expectedFontFamily)
    const fontFamilies = shifty.getFontFamilies(config)

    assert.strictEqual(
      fontFamilies.find(ff => ff === expectedFontFamily),
      undefined,
    )
  })

  test('should return all font families except the ignored font families', () => {
    const monaco = 'Monaco'
    const sfMono = 'SF Mono'

    const config = getShiftyConfig({
      fontFamilies: {
        ignoreFontFamilies: `${monaco},${sfMono}`,
      },
    })

    const fontFamilies = shifty.getFontFamilies(config)

    assert.strictEqual(fontFamilies.find(ff => ff === monaco), undefined)
    assert.strictEqual(fontFamilies.find(ff => ff === sfMono), undefined)
  })

  test('should return user specified font families', () => {
    const dankMono = 'Dank Mono'
    const operatorMono = 'Operator Mono'

    const config = getShiftyConfig({
      fontFamilies: {
        includeFontFamilies: `${dankMono},${operatorMono}`,
      },
    })

    const fontFamilies = shifty.getFontFamilies(config)

    assert.notStrictEqual(fontFamilies.find(ff => ff === dankMono), undefined)
    assert.notStrictEqual(
      fontFamilies.find(ff => ff === operatorMono),
      undefined,
    )
  })

  test('should return no codeface font families when ignored', () => {
    const config = getShiftyConfig({
      fontFamilies: {
        ignoreCodefaceFontFamilies: true,
      },
    })

    const fontFamilies = shifty.getFontFamilies(config)

    assert.strictEqual(
      fontFamilies.every(ff => !ff.types.includes(CODEFACE)),
      true,
    )
  })

  test('should return no macOS font families when ignored', () => {
    const config = getShiftyConfig({
      fontFamilies: {
        ignoreMacosFontFamilies: true,
      },
    })

    const fontFamilies = shifty.getFontFamilies(config)

    assert.strictEqual(
      fontFamilies.every(ff => !ff.types.includes(MAC_OS_ONLY)),
      true,
    )
  })

  test('should return no Windows font families when ignored', () => {
    const config = getShiftyConfig({
      fontFamilies: {
        ignoreWindowsFontFamilies: true,
      },
    })

    const fontFamilies = shifty.getFontFamilies(config)

    assert.strictEqual(
      fontFamilies.every(ff => !ff.types.includes(WINDOWS_ONLY)),
      true,
    )
  })

  test('should return no font families when all fonts are ignored', () => {
    const config = getShiftyConfig({
      fontFamilies: {
        ignoreCodefaceFontFamilies: true,
        ignoreMacosFontFamilies: true,
        ignoreWindowsFontFamilies: true,
      },
    })

    const fontFamilies = shifty.getFontFamilies(config)
    assert.strictEqual(fontFamilies.length, 0)
  })
})
