// const assert = require('assert')
// const shifty = require('../src/extension')
// const codefaceFontFamilies = require('../src/font-families/codeface-font-families')
// const macosFontFamilies = require('../src/font-families/macos-font-families')
// const windowsFontFamilies = require('../src/font-families/windows-font-families')

// setup(async () => {
//   originalColorTheme = shifty.getCurrentColorTheme()
//   await shifty.setColorTheme('Visual Studio Dark')

//   originalFontFamily = shifty.getCurrentFontFamily()
//   await shifty.setFontFamily('Monaco')
// })

// teardown(async () => {
//   shifty.deactivate()

//   if (originalColorTheme) {
//     await shifty.setColorTheme(originalColorTheme)
//   }

//   if (originalColorTheme) {
//     await shifty.setFontFamily(originalFontFamily)
//   }
// })

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
