const {
  getCurrentFontFamily,
  setFontFamily,
  allFontFamilies,
} = require('../src/font-families')
const {wait} = require('./test-utils')

test.skip('check all font familes for platform', function(done) {
  this.timeout(0)

  const originalFontFamily = getCurrentFontFamily()

  function getNextFontFamily(index = 0) {
    const nextFontFamily = allFontFamilies[index]

    if (!nextFontFamily) {
      setFontFamily(originalFontFamily).then(done)
      return
    }

    setFontFamily(nextFontFamily.id).then(() => {
      console.log(nextFontFamily.id)
      wait(7000).then(() => {
        getNextFontFamily(index + 1)
      })
    })
  }

  // TODO: test this!
  getNextFontFamily()
})
