![shifty banner](/images/shifty-banner.png?raw=true 'shifty banner')

## Table of contents

- [Prerequisites](#prerequisites)
  - [Mac, Linux](#mac-linux)
  - [Windows](#windows)
- [Contributing](#contributing)
- [License](#license)

<!-- - [Features](#features) -->
<!-- - [Using shifty](#using-shifty)
  - [Commands](#commands)
  - [Settings](#settings) -->

## Prerequisites

shifty depends on [codeface](https://github.com/chrissimpkins/codeface) typefaces. The easiest way to get started is to use our install script, however, you can also download the `.zip` or `.tar.xz` directly from [codeface](https://github.com/chrissimpkins/codeface) and install the fonts on your system manually.

> After installing fonts, **restart VS Code** for them to take affect

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

<!-- ## Features

Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow. -->

<!-- ## Using shifty -->

<!-- ### Commands -->

<!-- ### Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

- `myExtension.enable`: enable/disable this extension
- `myExtension.thing`: set to `blah` to do something -->

## Contributing

1. [Fork](https://help.github.com/en/articles/fork-a-repo) this repository to your own GitHub account and then [clone](https://help.github.com/en/articles/cloning-a-repository) it to your local device
1. Install the dependecies using `yarn`
1. Use VS Code launch configurations to debug or run integration tests
   - **Extension** - runs the extension from source with debugging enabled
   - **Extension Tests** - runs the integration test suite
1. Ensure any changes are documented in `CHANGELOG.md`

## License

MIT © Brent Mealhouse
