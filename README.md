# 📍Shifty depends on [Codeface](https://github.com/chrissimpkins/codeface) typefaces

### To experience shifty in it's full glory please follow our [Codeface installation](#codeface-installation) docs.

![shifty banner](/images/shifty-banner.png)

## Table of contents

- [Codeface installation](#codeface-installation)
  - [Mac, Linux](#mac-linux)
  - [Windows](#windows)
- [Features](#features)
- [Shift mode](#shift-mode)
  - [default](#default)
  - [discovery](#discovery)
  - [favorites](#favorites)
- [Commands](#commands)
- [Settings](#settings)
- [Contributing](#contributing)
- [License](#license)

## Codeface installation

The easiest way to get started is to use our install script, however, you can also download the `.zip` or `.tar.xz` directly from Codeface and install the fonts on your system manually.

> After installing Codeface font families, **restart VS Code** to have them take affect.

### Mac, Linux

```sh
git clone git://github.com/bmealhouse/vscode-shifty-font-families.git
cd vscode-shifty-font-families && ./install.sh
```

### Windows

```sh
git clone git://github.com/bmealhouse/vscode-shifty-font-families.git
cd vscode-shifty-font-families
./install.ps1
```

## Features

- Highly configurable (see [settings](#settings))
- Shift color theme & font family on 30min interval
- Shift interval can be used as a pomodoro timer
- Shift color theme & font family on VS Code startup
- Favorite/ignore color themes & font families
- Shifty status bar displays remaining time of shift interval

![shifty status](/images/shifty-status.png)

## Shift mode

Shifty supports three different shift modes when cycling through color themes & font families. I recommend starting with **discovery** mode until all color themes & font families have been favorited or ignored and then switch over to **favorites** mode.

### default

Cycles through all color themes & font families that have not been ignored.

### discovery

Cycles through color themes & font families that have not been favorited or ignored. When all color themes or font families have been favorited or ignored, shifty will fallback to using **favorites** mode.

### favorites

Cycles through favorite color themes & font families.

## Commands

Anything shifty can do is exposed via commands. Open the VS Code command palette (`⇧⌘P`) and type `shifty` to see the list of commands availabe to you.

| Name                        | Description                        |
| --------------------------- | ---------------------------------- |
| `shifty.shiftColorTheme`    | Shift color theme                  |
| `shifty.shiftFontFamily`    | Shift font family                  |
| `shifty.shiftBoth`          | Shift color theme & font family    |
| `shifty.favoriteColorTheme` | Favorite color theme               |
| `shifty.favoriteFontFamily` | Favorite font family               |
| `shifty.favoriteBoth`       | Favorite color theme & font family |
| `shifty.ignoreColorTheme`   | Ignore color theme                 |
| `shifty.ignoreFontFamily`   | Ignore font family                 |
| `shifty.ignoreBoth`         | Ignore color theme & font family   |
| `shifty.startShiftInterval` | Start shift interval               |
| `shifty.stopShiftInterval`  | Stop shift interval                |
| `shifty.showStatus`         | Show status                        |

## Settings

| Name                                               | Description                                                                                                                                    |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `shifty.shiftMode`                                 | Controls how shifty cycles through color themes & font families.                                                                               |
| `shifty.colorThemes.favoriteColorThemes`           | List of color themes you've favorited.                                                                                                         |
| `shifty.colorThemes.ignoreColorThemes`             | List of color themes you've ignored.                                                                                                           |
| `shifty.colorThemes.ignoreDarkColorThemes`         | Controls whether dark color themes are ignored. (default: `false`)                                                                             |
| `shifty.colorThemes.ignoreHighContrastColorThemes` | Controls whether high contrast color themes are ignored. (default: `false`)                                                                    |
| `shifty.colorThemes.ignoreLightColorThemes`        | Controls whether light color themes are ignored. (default: `false`)                                                                            |
| `shifty.fontFamilies.fallbackFontFamily`           | Controls which font family will be used as the fallback. Supports comma delimited values (e.g. `"SF Mono", monospace`). (default: `monospace`) |
| `shifty.fontFamilies.favoriteFontFamilies`         | List of font families you've favorited.                                                                                                        |
| `shifty.fontFamilies.ignoreCodefaceFontFamilies`   | Controls whether Codeface font families are ignored.                                                                                           |
| `shifty.fontFamilies.ignoreFontFamilies`           | List of font families you've ignored.                                                                                                          |
| `shifty.fontFamilies.includeFontFamilies`          | List of font families to include. Useful for including fonts you've purchased.                                                                 |
| `shifty.shiftInterval.shiftColorThemeIntervalMs`   | Number of milliseconds to wait before shifting the color theme. (defaults to 30min, use zero or null to disable color theme shift interval)    |
| `shifty.shiftInterval.shiftFontFamilyIntervalMs`   | Number of milliseconds to wait before shifting the font family. (defaults to 30min, use zero or null to disable font family shift interval)    |
| `shifty.startup.shiftColorThemeOnStartup`          | Controls whether the color theme shifts on VS Code startup. (default: `false`)                                                                 |
| `shifty.startup.shiftFontFamilyOnStartup`          | Controls whether the font family shifts on VS Code startup. (default: `false`)                                                                 |

## Contributing

1. [Fork](https://help.github.com/en/articles/fork-a-repo) this repository to your own GitHub account and then [clone](https://help.github.com/en/articles/cloning-a-repository) it to your local device
1. Install the dependecies using `yarn`
1. Use VS Code launch configurations to debug or run integration tests
   - **Extension** - runs the extension from source with debugging enabled
   - **Extension Tests** - runs the integration test suite
1. Ensure any changes are documented in `CHANGELOG.md`

## License

MIT © Brent Mealhouse
