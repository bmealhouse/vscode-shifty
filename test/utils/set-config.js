const vscode = require('vscode')

module.exports = async (keyPath, value) => {
  const [key, ...sections] = keyPath.split('.').reverse()
  const config = vscode.workspace.getConfiguration(sections.reverse().join('.'))
  return config.update(key, value, true)
}
