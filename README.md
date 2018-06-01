<h1 align="center">GDPR CLI</h1>

<p align="center">
  <img src="https://assets-cdn.github.com/favicon.ico" width=24 height=24/>
  <a href="https://github.com/mirkoschubert/gdpr-cli/blob/master/LICENSE.md">
    <img src="https://img.shields.io/github/license/mirkoschubert/gdpr-cli.svg" />
  </a>
</p>

<p align="center">A command line tool for checking your website for GDPR compliance.</p>
<p align="center">For more information about the GDPR please visit <a href="https://www.eugdpr.org">eugdpr.org</a>!</p>

---

<p align="center">
  <img src="https://raw.githubusercontent.com/mirkoschubert/gdpr-cli/master/gdpr-cli-screenshot.png" />
</p>

**Attention!** You are a newbie and don't understand the instructions down below? Visit our **new documentation** in [English](https://mirkoschubert.github.io/gdpr-cli/#/) and [German](https://mirkoschubert.github.io/gdpr-cli/#/de/)!

**GDPR CLI** is a easy-to-use command line tool for checking any given website for GDPR compliance. Since it is based on Node.js, the application is browser- and OS-independant. For everyone, who hasn't installed Node.js, I have planned to publish a pre-installed Package für macOS and Windows as well.

This command line tool scrapes a website for HTML-, CSS- and JavaScript-Files and tries to detect code, which is possibly sending personal data to other services, such as Google, Facebook, Instagram, WordPress and many more.

### Warning

This software is still in early alpha, so please use it at your own risk! If you find a bug or software incompability, please report it immediately by opening a ticket in the [Issues Section](https://github.com/mirkoschubert/gdpr-cli/issues). If you are familiar with Node.js and JavaScript programming, feel free to contribute by forking and/ or sending pull requests.

Neither I nor this program are giving any legal advice. **GDPR CLI** can not assist you with your website administration or the preperation of legal documents such as an imprint or a privacy notice. It simply helps you by (unobtrusively) revealing possible security flaws, which could affect the data securitiy of any visitor of your website. For more information please consult your lawyer.

### Installation

For installing **GDPR CLI** you need to have [node.js](https://nodejs.org/en/) and a package manager such as [npm](https://www.npmjs.com) or [yarn](https://yarnpkg.com/en/) already installed. If you use `npm`, you can install this package with the following command:

```
npm install -g gdpr-cli
```

With `yarn` it is just as easy as that:

```
yarn global add gdpr-cli
```

That's all - have fun!

### Usage

The basic usage for this command line tool is:

```
gdpr scan https://your-website.com
```

There are some options already, but they still need some improvement. I will update these usage instructions frequently. Stay tuned!

### Roadmap

* [x] Create the basic structure with an easy UI and a flexible Task manager
* [x] Get some basic information about the website (Meta Data)
  * [x] Check the installed Software
  * [x] Detect Theme when WordPress is installed
* [x] Check SSL Certificate
* [ ] Check for Web Fonts
  * [x] Google Fonts
  * [x] Adobe Typekit
  * [ ] FontAwesome
  * [x] Local Fonts
* [x] Check for DNS Prefetching
* [x] Check for Analytics Tools
  * [x] Google Analytics
  * [x] Google Tag Manager
  * [x] Matomo / Piwik
  * [x] WordPress Stats (Jetpack)
* [ ] Check for Image Embeds
  * [ ] Instagram
  * [ ] Pinterest
  * [ ] Flickr
* [ ] Check for Music Embeds
  * [ ] SoundCloud
* [ ] Check for Video Embeds
  * [ ] YouTube
  * [ ] Vimeo
* [ ] Check for external JavaScript Libraries
* [ ] Check for CDNs (e.g. WordPress, Cloudflase, AWS)
* [ ] Check for Cookies (if it's even possible)
* [ ] Check for advanced Fingerprinting (if possible)

### Contribution

Please report issues/bugs, feature requests and suggestions for improvements to the [issue tracker](https://github.com/mirkoschubert/gdpr-cli/issues).

You're welcome to fork the project and send me suggestions and new features via pull request. Please read the [contribution guidelines](https://mirkoschubert.github.io/gdpr-cli/#/dev-contrib) and send pull requests only to the newly installed `dev` branch!
