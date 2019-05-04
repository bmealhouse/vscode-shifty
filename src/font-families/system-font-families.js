const {MAC_OS, SYSTEM, WINDOWS} = require('./font-family-types')

module.exports = [
  {
    // Only available on MAC_OS when Microsoft Office products have been installed
    id: 'Consolas',
    supportedPlatforms: [WINDOWS],
    type: SYSTEM,
  },
  {
    id: 'Courier',
    supportedPlatforms: [MAC_OS],
    type: SYSTEM,
  },
  {
    id: 'Courier New',
    supportedPlatforms: [MAC_OS, WINDOWS],
    type: SYSTEM,
  },
  {
    id: 'Lucida Console',
    supportedPlatforms: [WINDOWS],
    type: SYSTEM,
  },
  {
    id: 'Menlo',
    supportedPlatforms: [MAC_OS],
    type: SYSTEM,
  },
  {
    id: 'Monaco',
    supportedPlatforms: [MAC_OS],
    type: SYSTEM,
  },
  {
    id: 'SF Mono',
    supportedPlatforms: [MAC_OS],
    type: SYSTEM,
  },
]
