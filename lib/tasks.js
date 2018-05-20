'use strict';

const got = require('got');
const chalk = require('chalk');
const sslCert = require('get-ssl-certificate');
const HTMLParser = require('./html-parser');
const CSSParser = require('./css-parser');
//const tools = require('./tools');
const UI = require('./ui');

class Tasks {
  constructor(url, uiInstance) {
    this.default_tasks = {
      html: {
        dependencies: []
      },
      css: {
        dependencies: ['html']
      },
      js: {
        dependencies: ['html']
      },
      ssl: {
        dependencies: ['html']
      },
      fonts: {
        dependencies: ['html', 'css']
      },
      prefetching: {
        dependencies: ['html']
      }
    };
    this.tasks = [];
    this.urls = {};
    this.urls.html = this.normalizeURL(url) || 'https://google.com/';
    this.urls.css = [];
    this.urls.js = [];
    this.html = '';
    this.css = [];
    this.js = [];
    this.cert = {};

    // Classes implementation
    this.ui = (!uiInstance) ? new UI() : uiInstance;
    this.hp, this.cp;
  }


  /**
   * Adds a new Task to the list
   * @param {string} task
   * @class Tasks
   */
  new(task) {
    this.default_tasks[task].dependencies.forEach(dep => {
      if (this.tasks.indexOf(dep) === -1) this.tasks.push(dep);
    });
    if (this.tasks.indexOf(task) === -1) this.tasks.push(task);
  }


  /**
   * Revoves a Task from the list
   * @param {string} task 
   * @class Tasks
   */
  remove(task) {
    if (this.tasks.indexOf(task) !== -1) {
      this.tasks.splice(this.tasks.indexOf(task), 1);
    }
    //console.log(this.tasks);
  }


  /**
   * Runs the Task Manager
   * @class Tasks
   */
  run() {
    // if no tasks specified do them all
    if (this.tasks.length === 0) {
      for (const t in this.default_tasks) {
        this.tasks.push(t)
      }
    }
    console.log(this.tasks);

    if (this.tasks.indexOf('html') !== -1) {

      //TODO: Try to run every task in one function @high
      this.loadHTMLfile()
        .then(
          () =>
          (this.tasks.indexOf('css') != -1) ? this.loadCSSfiles() : [])
        .then(
          () => (this.tasks.indexOf('js') != -1) ? this.loadJSfiles() : [])
        .then(() => {
          const url = new URL(this.urls.html);
          this.ui.message({
            silent: '',
            normal: 'Load SSL Certificate',
            verbose: 'Load SSL Certificate'
          });
          return (url.protocol === 'https:') ? this.getSSLCertificate(url.hostname) : ''; //TODO: better solution for checking the protocol
        })
        .then(() => {

          this.getGeneralInformation();
          this.getSSLInformation();
        })
        .catch(err => {
          this.ui.error(err.message);
        });
    }
  }


  getSSLInformation() {

    this.ui.headline('SSL Certificate');
    if (Object.keys(this.cert).length === 0 && this.cert.constructor === Object) {
      this.ui.error("This website doesn't use SSL/TLS.");
      return;
    } else {

      this.ui.listitem('Common Name', this.cert.subject.CN);
      this.ui.listitem('Country', this.cert.issuer.C);
      this.ui.listitem('Organization', this.cert.issuer.O);
      this.ui.listitem('Organization CN', this.cert.issuer.CN + '\n');

      this.ui.listitem('Valid from', this.cert.valid_from);
      this.ui.listitem('Valid to', this.cert.valid_to);
      this.ui.listitem('Serial Number', this.cert.serialNumber);
      this.ui.listitem('FP SHA-1', this.cert.fingerprint);
      this.ui.listitem('FP SHA-256', this.cert.fingerprint256);

      //console.log(this.cert);
    }
  }


  getGeneralInformation() {
    this.ui.headline('General Information');

    this.ui.listitem('Title', this.hp.getTitle());
    this.ui.listitem('Description', this.hp.getDescription());
    this.ui.listitem('URL', this.urls.html);

    let gen = this.hp.getGenerator(this.urls);
    gen = (gen === '') ? 'Unknown' : gen;
    this.ui.listitem('Software', gen);
    if (gen.toLowerCase().indexOf('wordpress') !== -1) {
      let theme = '';
      this.urls.css.forEach(css => {
        let match = css.match(/themes\/(.*?)\/style\.css/);
        if (match !== null) {
          theme = match[1];
          theme = theme.charAt(0).toUpperCase() + theme.slice(1); // Capitalize
        };
      });
      this.ui.listitem('Theme', (theme !== '') ? theme : 'Unknown');
    }
  }

  /**
   * Finds CSS and JS references in the HTML file
   * @class Tasks
   */
  setupAdditionalContent() {
    this.ui.message({
      silent: '',
      normal: 'Setup additional content',
      verbose: 'Setup additional content'
    });
    if (this.tasks.indexOf('css') != -1) {
      this.ui.message({
          silent: '',
          normal: '',
          verbose: chalk.dim('-> CSS files')
        }, '',
        false);
      this.urls.css = this.hp.getStylesheetURLs(this.urls.html);
    }
    if (this.tasks.indexOf('js') != -1) {
      this.ui.message({
          silent: '',
          normal: '',
          verbose: chalk.dim('-> JavaScript files')
        },
        '', false);
      this.urls.js = this.hp.getJavascriptURLs(this.urls.html);
    }
    return Promise.resolve(this.urls);
  }

  /**
   * Gets the SSL Certificate
   * @param {string} url 
   */
  getSSLCertificate(url) {
    return new Promise((resolve, reject) => {
      sslCert.get(url).then(cert => {
        this.cert = cert;
        this.remove('ssl');
        resolve(cert);
      }).catch(e => {
        reject(e);
      });
    });
  }


  /**
   * Gets any external CSS content
   * @class Tasks
   */
  loadCSSfiles() {
    this.ui.message({
      silent: '',
      normal: 'Load CSS Files',
      verbose: 'Load CSS Files'
    });
    let promises = this.urls.css.map(url => {
      this.ui.message({
        silent: '',
        normal: '',
        verbose: chalk.dim('-> ' + url)
      }, '', false);
      this.loadContent(url)
    });
    return Promise.all(promises).then(cssArray => {
      this.remove('css');
      return cssArray;
    });
  }


  /**
   * Gets any external JS content
   * @class Tasks
   */
  loadJSfiles() {
    this.ui.message({
      silent: '',
      normal: 'Load JavaScript files',
      verbose: 'Load JavaScript files'
    });
    let promises = this.urls.js.map(url => {
      this.ui.message({
        silent: '',
        normal: '',
        verbose: chalk.dim('-> ' + url)
      }, '', false);
      this.loadContent(url)
    });
    return Promise.all(promises).then(cssArray => {
      this.remove('js');
      return cssArray;
    });
  }


  /**
   * Gets the main HTML file
   * @class Tasks
   */
  loadHTMLfile() {
    this.ui.message({
      silent: '',
      normal: 'Loading HTML file ...',
      verbose: 'Loading ' + chalk.yellow(this.urls.html) + '...' //FIXME: Protocol Upgrade @low
    });
    return new Promise((resolve, reject) => {
      this.loadContent(this.urls.html).then(html => {
        this.html = html;
        this.hp = new HTMLParser(this.html);
        this.remove('html');
        resolve(this.setupAdditionalContent());
      }).catch(e => {
        reject(e);
      });
    });

  }


  /**
   * Loads external HTML, CSS und JS files
   * @param {string} url
   * @class Tasks
   */
  loadContent(url) {
    return got(url).then(res => {
      if (url === this.urls.html)
        this.urls.html =
        this.upgradeProtocol(this.urls.html, res.url); // SSL Upgrade FIX
      return Promise.resolve(res.body);
    });
  }

  // HELPERS

  normalizeURL(url) {
    let output = url;
    // delete the protocol
    output = output.replace(/(https?:)?\/\//, '');
    // get rid of trailing slash
    output = (output.startsWith('/')) ? output.substr(1) : output;
    // ensure that it ends with a slash
    output = (output.endsWith('/')) ? output : output + '/';
    return 'http://' + output;
  }

  upgradeProtocol(url, upgrade) {
    return (url != upgrade) ? upgrade : url;
  }
}

module.exports = Tasks;