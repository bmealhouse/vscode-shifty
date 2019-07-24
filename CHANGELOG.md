# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.1] - 2019-07-24

### Fixed

- Add additional debugging information to shift interval server

## [1.2.0] - 2019-07-19

### Added

- Display "(paused)" in status bar when shift interval is paused

## [1.1.1] - 2019-07-14

### Added

- Add debugging information to troubleshoot shifty issues

## [1.1.0] - 2019-07-14

### Added

- Favoites mode respects the following settings:
  - `shift.colorThemes.ignoreDarkColorThemes`
  - `shift.colorThemes.ignoreHighContrastColorThemes`
  - `shift.colorThemes.ignoreLightColorThemes`

### Changed

- All font families now includes user specific fonts

### Fixed

- Fix font family tests

## [1.0.2] - 2019-07-13

### Changed

- Use silent mode for shift interval client

### Fixed

- Fix ignore/favorite font filtering with `""`
- Use full object representation for favorite color themes and font families

### Removed

- Remove calls to `console.log` that were hanging around

## [1.0.1] - 2019-07-11

### Fixed

- Fix security vulnerabilities discovered by GitHub
- Fix "Linux Libertine Mono" font

## [1.0.0] - 2019-07-11

### Added

- Communication between VS Code instances
- Automatically start shift interval at VS Code startup
- Add `shifty.shiftInterval.automaticallyStartShiftInterval` setting
- Add `shifty.pauseShiftInterval` command
- Package extenstion using webpack

### Changed

- Convert codebase to TypeScript

### Fixed

- Fix logo alignment
- Fix outstanding issues (#1, #2, #3, #4)
- Fix "ProFontWindows" font

### Removed

- Remove shifty startup settings
  - `shifty.startup.shiftColorThemeOnStartup`
  - `shifty.startup.shiftFontFamilyOnStartup`
- Remove `shifty.stopShiftInterval` command

## [0.7.5] - 2019-05-14

### Changed

- Cleanup CHANGELOG formatting

## [0.7.4] - 2019-05-14

### Changed

- Display notifications from commands
- Execute commands from notification actions

## [0.7.3] - 2019-05-13

### Changed

- Change README formatting

## [0.7.2] - 2019-05-13

### Added

- Add shift interval docs to README

### Changed

- Replace tables in README with a mobile friendly format

## [0.7.1] - 2019-05-12

### Added

- Add version info to CHANGELOG

## [0.7.0] - 2019-05-12

### Added

- Add codeface dependency notice to README
- Add features section to README
- Add shift mode documentation to README
- Display notifications when ignoring color theme or font family

### Changed

- Write to settings synchronously
- Change shift interval settings from milliseconds to minutes
  - `shifty.shiftInterval.shiftColorThemeIntervalMs` -> `shifty.shiftInterval.shiftColorThemeIntervalMin`
  - `shifty.shiftInterval.shiftFontFamilyIntervalMs` -> `shifty.shiftInterval.shiftFontFamilyIntervalMin`
- Rename default `shifty.shiftMode` value from `all` -> `default`
- `shifty.colorThemes.ignoreHighContrastColorThemes` defaults to `false`
- `shifty.colorThemes.ignoreLightColorThemes` defaults to `false`
- Cleanup settings documentation

### Removed

- Remove "Using shifty" wrapper in README

## [0.6.0] - 2019-05-09

### Added

- Add commands for consistency
  - _"shifty: Favorite color theme & font family"_
  - _"shifty: Ignore color theme & font family"_

### Changed

- Fix colors in shifty banner & logo
- Rename commands for consistency
  - `shifty.shiftAll` -> `shifty.shiftBoth`
  - `shifty.favoriteCurrentColorTheme` -> `shifty.favoriteColorTheme`
  - `shifty.favoriteCurrentFontFamily` -> `shifty.favoriteFontFamily`
  - `shifty.ignoreCurrentColorTheme` -> `shifty.ignoreColorTheme`
  - `shifty.ignoreCurrentFontFamily` -> `shifty.ignoreFontFamily`
  - `shifty.showCurrentStatus` -> `shifty.showStatus`
- Update command descriptions for consistency
  - _"shifty: Add current color theme to favorites"_ -> _"shifty: Favorite color theme"_
  - _"shifty: Add current font family to favorites"_ -> _"shifty: Favorite font family"_
  - _"shifty: Ignore current color theme"_ -> _"shifty: Ignore color theme"_
  - _"shifty: Ignore current font family"_ -> _"shifty: Ignore font family"_
  - _"shifty: Show current status"_ -> _"shifty: Show status"_

## [0.5.4] - 2019-05-06

### Changed

- Change gallery banner color to #193549

## [0.5.3] - 2019-05-06

### Added

- shifty banner & logo

## [0.5.2] - 2019-05-04

### Fixed

- Improve font stability across all platforms

## [0.5.1] - 2019-05-03

### Fixed

- When setting the font family, wrap it with quotes if it has spaces

## [0.5.0] - 2019-05-03

### Added

- Add **discovery** mode to shift through color themes & font families that have not been favorited
- Add `shifty.shiftMode` setting

### Changed

- Sort all array settings alphabetically
- When a favorite is ignored, add it to the ignore list and remove it from favorites

### Removed

- Remove `shifty.favoritesEnabled` setting

## [0.4.0] - 2019-04-29

### Added

- Add **Favorite both** action to the current status notification
- Add prerequisites install documentation to `README.md`
- Add contributing and license information to `README.md`

### Changed

- Move release notes from `README.md` to `CHANGELONG.md`
- Allow `null` shift interval ms values

### Fixed

- Allow `null` fallback font family

### Removed

- Remove `shifty.enabled` setting since it's built-in to VS Code

## [0.3.1] - 2019-04-23

### Changed

- Use `os.type()` to filter out unsupported font families

### Removed

- Remove OS specific settings that are not needed
  - `shifty.fontFamilies.ignoreMacosFontFamilies`
  - `shifty.fontFamilies.ignoreWindowsFontFamilies`

## [0.3.0] - 2019-04-22

### Added

- Add setting for fallback font family: `shifty.fontFamilies.fallbackFontFamily`

## [0.2.1] - 2019-04-22

### Added

- Release notes for 0.2.0

## [0.2.0] - 2019-04-22

### Added

- Handle color themes that are installed/uninstalled/enabled/disabled
- Add favorites mode to cycle through favorite color themes and font families
- Show favorite actions in current status notification
  - **Favorite color theme**
  - **Favorite font family**
- Add settings to support favorites
  - `shifty.favoritesEnabled`
  - `shifty.colorThemes.favoriteColorThemes`
  - `shifty.fontFamilies.favoriteFontFamilies`
- Add commands to support favorites
  - _"shifty: Add current color themes to favorites"_
  - _"shifty: Add current font family to favorites"_

## [0.1.0] - 2019-04-19

### Added

- Add **shifty** status bar item
- Add command _"shifty: Show current status"_
- Show **Start shift interval** action in the shift interval status notification
- Add LICENSE

### Changed

- Remove notifications when the color theme or font family is shifted
- Use arrays instead of comma delimited strings
  - `shifty.colorThemes.ignoreColorThemes`
  - `shifty.fontFamilies.ignoreFontFamilies`
  - `shifty.fontFamilies.includeFontFamilies`
- Rename shift interval commands
  - _"shifty: Enable shift interval"_ -> _"shifty: Start shift interval"_
  - _"shifty: Disable shift interval"_ -> _"shifty: Stop shift interval"_

### Fixed

- Wrap events with subscriptions API for automatic disposal
- Keep shift interval timing in sync

## [0.0.3] - 2019-04-12

### Fixed

- Fix color theme shift error for users with extensions that doesn't have a `contributes` section in package.json

## [0.0.2] - 2019-04-12

### Removed

- Webpack bundling process

## [0.0.1] - 2019-04-12

### Added

- Initial release
