import {
  getFontFamily,
  setFontFamily,
  getAllFontFamilies,
} from '../font-families';
import {sleep} from './test-utils';

test.skip('manually test font families on different platforms', function(done) {
  this.timeout(0);

  const originalFontFamily = getFontFamily();
  const allFontFamilies = getAllFontFamilies();

  function getNextFontFamily(index = 0): void {
    const nextFontFamily = allFontFamilies[index];

    if (!nextFontFamily) {
      setFontFamily(originalFontFamily).then(done);
      return;
    }

    setFontFamily(nextFontFamily.id).then(() => {
      console.log(`${index}. ${nextFontFamily.id}`);
      sleep(7500).then(() => {
        getNextFontFamily(index + 1);
      });
    });
  }

  getNextFontFamily();
});

// .mac {
//   --monaco-monospace-font:Monaco,Menlo,Inconsolata,"Courier New",monospace
// }

// .windows {
//   --monaco-monospace-font:Consolas,Inconsolata,"Courier New",monospace
// }

// .linux {
//   --monaco-monospace-font:"Droid Sans Mono",Inconsolata,"Courier New",monospace,"Droid Sans Fallback"
// }
