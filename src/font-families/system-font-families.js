const {LINUX, MAC_OS, SYSTEM, WINDOWS} = require('./font-family-types')

module.exports = [
  {
    // Only available on MAC_OS when Microsoft Office products have been installed
    id: 'Consolas',
    supportedPlatforms: [LINUX, WINDOWS],
    type: SYSTEM,
  },
  {
    id: 'Courier',
    supportedPlatforms: [LINUX, MAC_OS],
    type: SYSTEM,
  },
  {
    id: 'Courier New',
    supportedPlatforms: [LINUX, MAC_OS, WINDOWS],
    type: SYSTEM,
  },
  {
    id: 'Lucida Console',
    supportedPlatforms: [LINUX, WINDOWS],
    type: SYSTEM,
  },
  {
    id: 'Menlo',
    supportedPlatforms: [LINUX, MAC_OS],
    type: SYSTEM,
  },
  {
    id: 'Monaco',
    supportedPlatforms: [LINUX, MAC_OS],
    type: SYSTEM,
  },
  {
    id: 'SF Mono',
    supportedPlatforms: [LINUX, MAC_OS],
    type: SYSTEM,
  },
]
