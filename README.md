# 📍 Shifty depends on [Codeface](https://github.com/chrissimpkins/codeface) typefaces

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

| Name                                               | Description                                                                                                                                 |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `shifty.shiftMode`                                 | Controls how shifty cycles through color themes & font families.                                                                            |
| `shifty.colorThemes.favoriteColorThemes`           | Favorite color themes.                                                                                                                      |
| `shifty.colorThemes.ignoreColorThemes`             | Color themes to ignore.                                                                                                                     |
| `shifty.colorThemes.ignoreDarkColorThemes`         | Determines if dark color themes should be ignored.                                                                                          |
| `shifty.colorThemes.ignoreHighContrastColorThemes` | Determines if high contrast color themes should be ignored.                                                                                 |
| `shifty.colorThemes.ignoreLightColorThemes`        | Determines if light color themes should be ignored.                                                                                         |
| `shifty.fontFamilies.fallbackFontFamily`           | Fallback font family. This is useful when a font is not supported inside the integrated terminal.                                           |
| `shifty.fontFamilies.favoriteFontFamilies`         | Favorite font families.                                                                                                                     |
| `shifty.fontFamilies.ignoreCodefaceFontFamilies`   | Determines if codeface font families should be ignored.                                                                                     |
| `shifty.fontFamilies.ignoreFontFamilies`           | Font families to ignore.                                                                                                                    |
| `shifty.fontFamilies.includeFontFamilies`          | Includes font families.                                                                                                                     |
| `shifty.shiftInterval.shiftColorThemeIntervalMs`   | Number of milliseconds to wait before shifting the color theme. (defaults to 30min, use zero or null to disable color theme shift interval) |
| `shifty.shiftInterval.shiftFontFamilyIntervalMs`   | Number of milliseconds to wait before shifting the font family. (defaults to 30min, use zero or null to disable font family shift interval) |
| `shifty.startup.shiftColorThemeOnStartup`          | Determines if the color theme shifts when VS Code starts up.                                                                                |
| `shifty.startup.shiftFontFamilyOnStartup`          | Determines if the font family shifts when VS Code starts up.                                                                                |

## Contributing

1. [Fork](https://help.github.com/en/articles/fork-a-repo) this repository to your own GitHub account and then [clone](https://help.github.com/en/articles/cloning-a-repository) it to your local device
1. Install the dependecies using `yarn`
1. Use VS Code launch configurations to debug or run integration tests
   - **Extension** - runs the extension from source with debugging enabled
   - **Extension Tests** - runs the integration test suite
1. Ensure any changes are documented in `CHANGELOG.md`

## License

MIT © Brent Mealhouse
