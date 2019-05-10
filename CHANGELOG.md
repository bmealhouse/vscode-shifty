# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Add codeface dependency notice

## [0.6.0] - 2019-05-09

### Added

- Add commands for consistency
  - _"shifty: Favorite color theme & font family"_
  - _"shifty: Ignore color theme & font family"_

### Changed

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

## [0.5.5] - 2019-05-06

### Changed

- Fix colors in shifty banner & logo

## [0.5.4] - 2019-05-06

### Changed

- Change gallery banner color to #193549

## [0.5.3] - 2019-05-06

### Added

- shifty banner & logo

## [0.5.2] - 2019-05-04

## Fixed

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
