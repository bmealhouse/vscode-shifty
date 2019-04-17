const {SYSTEM} = require('./types/font-families')
const {MAC_OS, WINDOWS} = require('./types/supported-platforms')

module.exports = [
  {id: 'Consolas', type: SYSTEM, supportedPlatforms: [WINDOWS]},
  {id: 'Courier', type: SYSTEM, supportedPlatforms: [MAC_OS]},
  {id: 'Courier New', type: SYSTEM, supportedPlatforms: [WINDOWS]},
  {id: 'Lucida Console', type: SYSTEM, supportedPlatforms: [WINDOWS]},
  {id: 'Menlo', type: SYSTEM, supportedPlatforms: [MAC_OS]},
  {id: 'Monaco', type: SYSTEM, supportedPlatforms: [MAC_OS]},
  {id: 'SF Mono', type: SYSTEM, supportedPlatforms: [MAC_OS]},
]
