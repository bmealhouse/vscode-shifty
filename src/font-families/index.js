const codefaceFontFamilies = require('./codeface-font-families')
const macosFontFamilies = require('./macos-font-families')
const windowsFontFamilies = require('./windows-font-families')

// TODO: provide documenation for font installation on MacOS & Windows
module.exports = [
  ...codefaceFontFamilies,
  ...macosFontFamilies,
  ...windowsFontFamilies,
  // 'AHAMONO',
]
