import {FontFamily, FontFamilyPlatform, FontFamilyType} from '.'

export const systemFontFamilies: FontFamily[] = [
  {
    // Only available on MAC_OS when Microsoft Office products have been installed
    id: 'Consolas',
    supportedPlatforms: [FontFamilyPlatform.WINDOWS],
    type: FontFamilyType.SYSTEM,
  },
  {
    id: 'Courier',
    supportedPlatforms: [FontFamilyPlatform.MAC_OS],
    type: FontFamilyType.SYSTEM,
  },
  {
    id: 'Courier New',
    supportedPlatforms: [FontFamilyPlatform.MAC_OS, FontFamilyPlatform.WINDOWS],
    type: FontFamilyType.SYSTEM,
  },
  {
    id: 'Lucida Console',
    supportedPlatforms: [FontFamilyPlatform.WINDOWS],
    type: FontFamilyType.SYSTEM,
  },
  {
    id: 'Menlo',
    supportedPlatforms: [FontFamilyPlatform.MAC_OS],
    type: FontFamilyType.SYSTEM,
  },
  {
    id: 'Monaco',
    supportedPlatforms: [FontFamilyPlatform.MAC_OS],
    type: FontFamilyType.SYSTEM,
  },
  {
    id: 'SF Mono',
    supportedPlatforms: [FontFamilyPlatform.MAC_OS],
    type: FontFamilyType.SYSTEM,
  },
]
