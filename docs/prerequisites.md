# Prerequisites

This software is based on Node.js, so it is mandatory to have `node` and a package manager such as `npm` or `yarn` installed. If you don't, please follow the instructions.

## Installing Node.js

Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine. Since **GDPR CLI** is written in JavaScript, it depends on this software.

To download it, please visit [nodejs.org](https://nodejs.org/en/). You can either choose the LTS or current version. Just click on one of the buttons on their home page. You should get the right version for your operating system.

### Windows

!> Node.js requires Windows 7 or later. If you still have an older version of Windows, please update your OS first.

To install Node.js, you just have to open the previously downloaded file and follow the instructions of the installer. Once it's finished, just look for the `Windows Powershell` and open it.

### macOS

To install Node.js on macOS, you just have to open the previously downloaded file and follow the instructions of the installer. Once it's finished, just look for the `terminal` application and open it.

?> If you have `homebrew` installed, just type `brew install node` instead.

### Linux

To install Node.js on Linux, you just have to open the previously downloaded file and follow the instructions of the installer. Once it's finished, just open your preferred `terminal` application.

?> If an installer or binary for your Linux Distrobution isn't available, you can use your package installer instead. Please read those [detailed instructions](https://nodejs.org/en/download/package-manager/)!

## Checking the Installation

Whatever operating system you're using, you should always check if Node.js is installed correctly. Simply open `Windows Powershell` or your `terminal` application and type the following commands:

```bash
node -v
```

```bash
npm -v
```

If both commands display a version number, everything is okay and you have successfully installed Node.js!

## Troubleshooting

**node: command not found**

On macOS and Linux it is possible that you have to insert a path variable in your shell configuration file manually. To check if this path variable is missing, please type the following command in your `terminal` application:

```bash
echo $PATH | grep -c /usr/local/bin
```

If it outputs a `0`, you have to fix this with the command:

```bash
echo "export PATH=$PATH:/usr/local/git/bin:/usr/local/bin" >> ~/.bashrc
```

That's it, you're done!

!> If you use another shell, such as 'zsh', you should change this command accordingly.
