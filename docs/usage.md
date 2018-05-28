# Usage

If you have Node.js and **GDPR CLI** installed, you're ready to go! Just open your preferred `terminal` application or `Windows Powershell` and type:

```bash
gdpr scan yourwebsite.com
```

The tool should scan the website you entered and show you some information about this site. You can use it to check if any element of the website is sending data to non-European servers and to adjust your privacy notice accordingly.

The basic usage of **GDPR CLI** is:

```bash
gdpr [command] [options] [URL]
```

## Commands

| Command | Meaning                                           |
| :------ | :------------------------------------------------ |
| scan, s | Scan Command - scans and analyses a given website |
| help    | Help - **not finished yet**                       |


## Options

There are already some Options available to specify your needs.

#### Global Options

| Option        | Meaning                                               |
| :------------ | :---------------------------------------------------- |
| -v, --verbose | Verbose Mode - outputs everything there is            |
| -m, --mute    | Muted Mode - outputs only the results of the analysis |
| -V, --version | Version - shows the version of **GDPR CLI**           |
| -h, --help    | Help - the basic global help                          |

#### Options for the `scan` Command

| Option            | Meaning                                |
| :---------------- | :------------------------------------- |
| -f, --fonts       | Shows only the Fonts results           |
| -s, --ssl         | Shows only the SSL Certificate         |
| -p, --prefetching | Shows only the DNS Prefetching results |
| -a, --analytics   | Shows only the Analytics results       |


## Combination

You can combine those options freely. For example:

```bash
gdpr scan -vfa yourwebsite.com
```

In this case **GDPR CLI** will start in Verbose Mode and only scan for Fonts and Analytics tools.