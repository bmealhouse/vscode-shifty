const {MAC_OS, WINDOWS} = require('./font-family-types')

module.exports = [
  {id: 'Consolas', type: WINDOWS, supportedPlatforms: [WINDOWS]},
  // TODO: figure out how to handle platforms
  // {id: 'Courier', type: SYSTEM, supportedPlatforms: [MAC_OS, WINDOWS]}
  // {id: 'Courier New', type: SYSTEM, supportedPlatforms: [MAC_OS, WINDOWS]}
  {id: 'Lucida Console', type: WINDOWS, supportedPlatforms: [WINDOWS]},
  {id: 'Menlo', type: MAC_OS, supportedPlatforms: [MAC_OS]},
  {id: 'Monaco', type: MAC_OS, supportedPlatforms: [MAC_OS]},
  {id: 'SF Mono', type: MAC_OS, supportedPlatforms: [MAC_OS]},
]
