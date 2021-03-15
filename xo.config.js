module.exports = {
  ignores: ["out"],
  prettier: true,
  rules: {
    "capitalized-comments": "off",
  },
  settings: {
    "import/core-modules": ["vscode"],
    "import/resolver": {
      node: {},
    },
  },
};
