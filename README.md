# 📍 Shifty depends on [Codeface](https://github.com/chrissimpkins/codeface) typefaces

### To experience shifty in it's full glory, please review our [Codeface installation](#codeface-installation) docs.

![shifty banner](/images/shifty-banner.png)

## Table of contents

- [Codeface installation](#codeface-installation)
  - [Mac, Linux](#mac-linux)
  - [Windows](#windows)
- [Features](#features)
- [Shift interval](#shift-interval)
- [Shift mode](#shift-mode)
  - [default](#default)
  - [discovery](#discovery)
  - [favorites](#favorites)
- [Commands](#commands)
- [Settings](#settings)
- [Contributing](#contributing)
- [License](#license)

## Codeface installation

The easiest way to get started is to use our install script, however, you can also download the `.zip` or `.tar.xz` directly from [Codeface](https://github.com/chrissimpkins/codeface) and install the fonts on your system manually.

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
- Favorite/ignore color themes & font families
- Shifty status bar displays remaining time of shift interval

![shifty status](/images/shifty-status.gif)

## Shift interval

This is the bread & butter of shifty. By default, the shift interval will be started for you automatically. You can pause the shift interval by opening the command palette (`⇧⌘P`) and typing `shifty pause`.

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

- Shift color theme
- Shift font family
- Shift color theme & font family
- Favorite color theme
- Favorite font family
- Favorite color theme & font family
- Ignore color theme
- Ignore font family
- Ignore color theme & font family
- Start shift interval
- Pause shift interval
- Show status

## Settings

Shifty has many configuration options. Please review these settings so shifty can fulfill your every desire.

**`shifty.shiftMode`**<br/>
Controls how shifty cycles through color themes & font families.

**`shifty.colorThemes.favoriteColorThemes`**<br/>
List of color themes you've favorited.

**`shifty.colorThemes.ignoreColorThemes`**<br/>
List of color themes you've ignored.

**`shifty.colorThemes.ignoreDarkColorThemes`**<br/>
Controls whether dark color themes are ignored.<br/>
**default: `false`**

**`shifty.colorThemes.ignoreHighContrastColorThemes`**<br/>
Controls whether high contrast color themes are ignored.<br/>
**default: `false`**

**`shifty.colorThemes.ignoreLightColorThemes`**<br/>
Controls whether light color themes are ignored.<br/>
**default: `false`**

**`shifty.fontFamilies.fallbackFontFamily`**<br/>
Controls which font family will be used as the fallback. Supports comma delimited values (e.g. `"SF Mono", monospace`).<br/>
**default: `monospace`**

**`shifty.fontFamilies.favoriteFontFamilies`**<br/>
List of font families you've favorited.

**`shifty.fontFamilies.ignoreCodefaceFontFamilies`**<br/>
Controls whether Codeface font families are ignored.

**`shifty.fontFamilies.ignoreFontFamilies`**<br/>
List of font families you've ignored.

**`shifty.fontFamilies.includeFontFamilies`**<br/>
List of font families to include. Useful for including fonts you've purchased.

**`shifty.shiftInterval.automaticallyStartShiftInterval`**<br/>
Controls whether the shift interval will start automatically.<br/>
**default: `true`**

**`shifty.shiftInterval.shiftColorThemeIntervalMin`**<br/>
Number of minutes to wait before shifting the color theme. Use `0` or `null` to disable the color theme shift interval.<br/>
**default: `30`**

**`shifty.shiftInterval.shiftFontFamilyIntervalMin`**<br/>
Number of minutes to wait before shifting the font family. Use `0` or `null` to disable the font family shift interval.<br/>
**default: `30`**

## Contributing

1. [Fork](https://help.github.com/en/articles/fork-a-repo) this repository to your own GitHub account and then [clone](https://help.github.com/en/articles/cloning-a-repository) it to your local device
1. Install the dependecies using `yarn`
1. Use VS Code launch configurations to debug or run integration tests
   - **Extension** - runs the extension from source with debugging enabled
   - **Extension Tests** - runs the integration test suite
1. Ensure any changes are documented in `CHANGELOG.md`

## License

MIT © Brent Mealhouse
