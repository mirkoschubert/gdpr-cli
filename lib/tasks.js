'use strict';

const URL = require('url').URL; // for backwards compability (node < 10)
const got = require('got');
const chalk = require('chalk');
const sslCert = require('get-ssl-certificate');
const HTMLParser = require('./html-parser');
const CSSParser = require('./css-parser');
const JSParser = require('./js-parser');
// const tools = require('./tools');
const UI = require('./ui');

class Tasks {
  constructor(url, uiInstance) {
    this.default_tasks = {
      normalize: {
        dependencies: [],
        mandatory: true
      },
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
        dependencies: ['html', 'css']
      },
      fonts: {
        dependencies: ['html', 'css']
      },
      prefetching: {
        dependencies: ['html', 'css']
      },
      analytics: {
        dependencies: ['html', 'css', 'js']
      }
    };

    this.default_headers = {
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36'
    }

    // Classes implementation
    this.ui = (!uiInstance) ? new UI() : uiInstance;
    this.hp, this.cp, this.jp;

    this.url = url;
    this.tasks = [];
    this.data = {};

    // Put mandatory tasks already in the task list
    this.tasks = this.tasks.concat(this.getMandatoryTasks());
  }


  /**
   * Adds a new Task to the list
   * @param {string} task
   * @class Tasks
   */
  new(task) {
    console.log(task);
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
  }


  /**
   * Checks if the task list has a specifig task
   * @param {string} task
   * @class Tasks
   */
  hasTask(task) {
    return this.tasks.indexOf(task) !== -1;
  }


  /**
   * Gets all Tasks, which are mandatory - even with Task Selectors
   * @class Tasks
   */
  getMandatoryTasks() {
    let t = [];
    for (const task in this.default_tasks) {
      if (this.default_tasks[task].mandatory) t.push(task);
    }
    return t;
  }


  /**
   * Prepare Task Runner Array
   * @class Tasks
   */
  prepareTasks() {
    // if no tasks specified do them all
    if (this.tasks.length === this.getMandatoryTasks().length) {
      for (const t in this.default_tasks) {
        if (!this.default_tasks[t].mandatory) this.tasks.push(t)
      }
    }
    this.tasks.forEach(t => {
      this.data[t] = {};
    });
  }


  /**
   * Runs the Task Manager
   * @class Tasks
   */
  run() {
    this.prepareTasks();
    // console.log('Tasks: ', this.tasks);

    if (this.tasks.indexOf('html') !== -1) {
      this.normalizeURL()
        .then(() => this.processHTML())
        .then(() => this.processCSS())
        .then(() => this.processJS())
        .then(() => this.processSSL())
        .then(() => {
          // console.log('Remaining: ', this.tasks);

          this.getGeneralInformation();
          this.getSSLInformation();
          this.getFontInformation();
          this.getPrefetchingInformation();
          this.getAnalyticsInformation();

          console.log('\n');
          // console.log('Remaining: ', this.tasks);
        })
        .catch(e => console.log(e.message));
    }
  }


  // INFO: Content Creation

  getAnalyticsInformation() {
    if (this.hasTask('analytics')) {
      const ga = this.jp.getGoogleAnalyticsFeatures();
      const gtag = this.jp.getGoogleTagManagerFeatures();
      const pw = this.jp.getPiwikFeatures();

      this.ui.headline('Analytics');
      if (typeof ga === 'undefined' && typeof gtag === 'undefined' &&
        typeof pw === 'undefined' && !this.jp.hasWordPressStats())
        this.ui.info('No Analytics Tool has been found.');

      // console.log(ga);
      if (typeof ga !== 'undefined') {
        this.ui.info(chalk.red('Google Analytics') + ' has been found.\n');
        this.ui.listitem('Property ID', ga.property_id);
        this.ui.listitem('Anonymized IP', (ga.anonymize_ip) ? 'Yes' : 'No');
        this.ui.listitem('Force SSL', (ga.force_ssl) ? 'Yes' : 'No');
      }
      // console.log(gtag);
      if (typeof gtag !== 'undefined') {
        this.ui.info(
          'The ' + chalk.red('Google Tag Manager') + ' has been found.\n');
        this.ui.listitem('Property ID', gtag.property_id);
        this.ui.listitem('Anonymized IP', (gtag.anonymize_ip) ? 'Yes' : 'No');
      }
      // console.log(pw);
      if (typeof pw !== 'undefined') {
        this.ui.info(chalk.red('Matomo') + ' has been found.\n');
        this.ui.listitem('Matomo URL', pw.url);
        this.ui.listitem('Site ID', pw.site_id);
      }
      if (this.jp.hasWordPressStats()) {
        this.ui.info(
          'The ' + chalk.red('WordPress Stats') +
          ' (Jetpack) has been found.');
      }

      this.remove('analytics');
    }
  }

  getPrefetchingInformation() {
    if (this.hasTask('prefetching')) {
      const dns = this.hp.checkPrefetching();

      this.ui.headline('DNS Prefetching');

      if (dns.length === 0) {
        this.ui.info(
          chalk.yellow(this.data.html.url.hostname) +
          ' supports no DNS prefetching.')
      } else {
        this.ui.info(
          chalk.yellow(this.data.html.url.hostname) + ' has ' +
          chalk.red(dns.length) + ' DNS prefetching elements.\n');
        this.ui.settable({
          cells: 3,
          widths: [5, 30, 0]
        });

        dns.forEach((url, i) => {
          let u = (url.startsWith('//')) ? url.replace('//', '') : url;
          let explanation = '';

          if (u.match(/fonts\.googleapis\.com/) !== null) explanation = 'Google Fonts';
          if (u.match(/gravatar\.com/) !== null) explanation = 'Automattic Gravatar Service';
          if (u.match(/s\.w\.org/) !== null) explanation = 'WordPress Emojis CDN';
          if (u.match(/s[0-9]\.wp\.com/) !== null) explanation = 'WordPress Styles CDN';
          if (u.match(/i[0-9]\.wp\.com/) !== null) explanation = 'WordPress Images CDN';
          if (u.match(/v[0-9]\.wordpress\.com/) !== null) explanation = 'WordPress Videos CDN';
          if (u.match(/maxcdn\.bootstrapcdn\.com/) !== null) explanation = 'Bootstrap CDN';
          if (u.match(/checkout\.stripe\.com/) !== null) explanation = 'Stripe Online Payments';
          if (u.match(/code\.jquery\.com/) !== null) explanation = 'jQuery CDN';
          if (u.match(/translate\.google\.com/) !== null) explanation = 'Google Translate';
          if (u.match(/use\.typekit\.net/) !== null) explanation = 'Adobe Typekit Web Fonts';
          if (u.match(/use\.fontawsome\.com/) !== null) explanation = 'Font Awesome';

          this.ui.tableitem(
            [chalk.yellow(String(i + 1) + '.'), u, chalk.dim(explanation)])
        });
      }

      this.remove('prefetching');
    }
  }

  getFontInformation() {
    if (this.hasTask('fonts')) {
      const default_types = [{
          type: 'google',
          decription: 'Google Fonts'
        },
        {
          type: 'typekit',
          decription: 'Adobe Typekit Fonts'
        },
        {
          type: 'wordpress',
          decription: 'Fonts from wordpress.com'
        },
        {
          type: 'local',
          decription: 'Fonts directly from the site'
        }
      ];
      this.data.fonts = {};
      console.log('AUTOPTIMIZE:', this.cp.hasAutoptimize());
      console.log(this.cp.getAutoptimizeFonts(this.data.html.url));
      if (!this.cp.hasAutoptimize()) {
        if (this.cp.hasGoogleFonts()) this.data.fonts.google = this.cp.getGoogleFonts();
        if (this.jp.hasTypekitJS() || this.cp.hasTypekitCSS()) this.data.fonts.typekit = [];
        if (this.jp.hasTypekitJS()) this.jp.getTypekitJSFonts().forEach(f => this.data.fonts.typekit.push(f));
        if (this.cp.hasTypekitCSS()) this.cp.getTypekitCSSFonts().forEach(f => this.data.fonts.typekit.push(f));
        if (this.cp.hasWordPressFonts()) this.data.fonts.wordpress = this.cp.getWordPressFonts();
        if (this.cp.hasLocalFonts(this.data.html.url)) this.data.fonts.local = this.cp.getLocalFonts(this.data.html.url);
      } else this.data.fonts = this.cp.getAutoptimizeFonts(this.data.html.url);
      //console.log(this.data.fonts);

      let todo = [];
      default_types.forEach(el => {
        if (typeof this.data.fonts[el.type] !== 'undefined') todo.push(el);
      });

      this.ui.headline('Fonts Implementation');
      this.ui.settable({
        cells: 3,
        widths: [5, 25, 0]
      });

      if (todo.length !== 0) {
        todo.forEach((el, i) => {
          let count = this.cp.countFonts(this.data.fonts[el.type]);
          if (i > 0) console.log('');
          this.ui.info(el.decription + ': ' + chalk.red(count.length) + '\n');
          count.forEach((f, j) => {
            this.ui.tableitem([chalk.yellow(String(j + 1) + '.'), f, chalk.dim(this.cp.getFontStyles(this.data.fonts[el.type], f))]);
          });
        });
      } else this.ui.info('There were no Fonts found.');

      this.remove('fonts');
    }
  }

  /**
   * Gathers SSL Information
   * @class Tasks
   */
  getSSLInformation() {
    if (this.hasTask('ssl')) {
      if (Object.keys(this.data.ssl).length === 0 &&
        this.data.ssl.constructor === Object) {
        this.ui.headline('SSL Certificate');
        this.ui.error('There is no SSL/TLS available.', false);
        this.remove('ssl');
        return;
      } else {
        this.ui.headline('SSL Certificate');

        this.ui.listitem('Common Name', this.data.ssl.common_name);
        this.ui.listitem('Country', this.data.ssl.country);
        this.ui.listitem('Organization', this.data.ssl.organization);
        this.ui.listitem('Organization CN', this.data.ssl.org_cn + '\n');

        this.ui.listitem('Valid from', this.data.ssl.valid_from);
        this.ui.listitem('Valid to', this.data.ssl.valid_to);
        this.ui.listitem('Serial Number', this.data.ssl.serial_nr);
        this.ui.listitem('FP SHA-1', this.data.ssl.fingerprint);
        this.ui.listitem('FP SHA-256', this.data.ssl.fingerprint256);
        //this.ui.message('SSL FINISHED');
        this.remove('ssl');
      }
    }
  }


  /**
   * Gathes General Information (meta data) of the Website
   * @class Tasks
   */
  getGeneralInformation() {
    this.ui.headline('General Information');

    this.ui.listitem('Title', this.hp.getTitle());
    this.ui.listitem('Description', this.hp.getDescription());
    this.ui.listitem('URL', this.data.html.url.href);

    let gen = this.hp.getGenerator(this.data.css);
    gen = (gen === '') ? 'Unknown' : gen;
    this.ui.listitem('Software', gen);
    if (gen.toLowerCase().indexOf('wordpress') !== -1) {
      let theme = '';
      this.data.css.forEach(css => {
        let match = css.url.href.match(/themes\/(.*?)\/style\.css/);
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
    if (this.hasTask('html')) {
      if (this.tasks.indexOf('css') !== -1 || this.tasks.indexOf('js') !== -1) {
        this.ui.message({
          normal: 'Setup additional content',
          verbose: 'Setup additional content'
        });
      }
      if (this.tasks.indexOf('css') !== -1) {
        this.ui.message({
          verbose: chalk.dim('-> CSS files')
        }, '', false);
        this.data.css = this.hp.getStylesheetURLs(this.data.html.url.href);
        // console.log(this.data.css);
      }
      if (this.tasks.indexOf('js') !== -1) {
        this.ui.message({
          verbose: chalk.dim('-> JavaScript files')
        }, '', false);
        this.data.js = this.hp.getJavascriptURLs(this.data.html.url.href);
        // console.log(this.data.js);
      }
      // this.ui.message('ADDITIONAL CONTENT FINISHED');
      this.remove('html');
      return Promise.resolve(this.urls);
    } else
      return Promise.resolve(100); // Status 100 CONTINUE
  }


  // INFO: PROCESSING


  /**
   * Gets the SSL Certificate
   * @class Tasks
   */
  processSSL() {
    if (this.hasTask('ssl')) {
      this.ui.message({
        normal: 'Loading SSL Certificate',
        verbose: 'Loading SSL Certificate'
      });
      return new Promise((resolve, reject) => {
        if (this.data.html.url.protocol !== 'https:') {
          this.ui.error('Can\'t establish SSL/TLS connection!');
          resolve();
        } else {
          sslCert.get(this.data.html.url.hostname)
            .then(cert => {
              this.data.ssl.common_name = cert.subject.CN;
              this.data.ssl.country = cert.issuer.C;
              this.data.ssl.organization = cert.issuer.O;
              this.data.ssl.org_cn = cert.issuer.CN;
              this.data.ssl.valid_from = cert.valid_from;
              this.data.ssl.valid_to = cert.valid_to;
              this.data.ssl.serial_nr = cert.serialNumber;
              this.data.ssl.fingerprint = cert.fingerprint;
              this.data.ssl.fingerprint256 = cert.fingerprint256;

              // this.ui.message('SSL FINISHED');
              resolve(cert);
            })
            .catch(e => reject(e));
        }
      });
    } else
      return Promise.resolve(100); // Status 100 CONTINUE
  }


  /**
   * Gets any external JS content
   * @class Tasks
   */
  processJS() {
    if (this.hasTask('js')) {
      this.ui.message({
        normal: 'Loading JS files',
        verbose: 'Loading JS files'
      });
      return this.processMultipleItems(this.data.js, this.loadExternalItem)
        .then(res => {
          this.data.js = (res !== 404) ? res : [];
          this.ui.message({
            verbose: chalk.dim('-> Looking for Inline JavaScript')
          }, {
            code: 200,
            msg: 'OK'
          }, false);
          this.data.js.inline = this.hp.getInlineJS();
          // this.ui.message('JS FINISHED');
          this.jp = new JSParser(this.data.js);
          this.remove('js');
          return res;
        });
    } else
      return Promise.resolve(100); // Status 100 CONTINUE
  }


  /**
   * Gets any external CSS content
   * @class Tasks
   */
  processCSS() {
    if (this.hasTask('css')) {
      this.ui.message({
        normal: 'Loading CSS files',
        verbose: 'Loading CSS files'
      });
      return this.processMultipleItems(this.data.css, this.loadExternalItem)
        .then(res => {
          this.data.css = (res !== 404) ? res : [];
          this.ui.message({
            verbose: chalk.dim('-> Looking for Inline CSS')
          }, {
            code: 200,
            msg: 'OK'
          }, false);
          this.data.css.inline = this.hp.getInlineCSS();
          // this.ui.message('CSS FINISHED');
          this.cp = new CSSParser(this.data.css);
          this.remove('css');
          return res;
        });
    } else
      return Promise.resolve(100); // Status 100 CONTINUE
  }


  /**
   * Gets the main HTML file
   * @class Tasks
   */
  processHTML() {
    if (this.hasTask('html')) {
      this.ui.message({
        normal: 'Loading HTML file',
        verbose: 'Loading ' + chalk.yellow(this.data.html.url.href)
      });
      return this.loadExternalItem(this.data.html).then(res => {
        this.data.html = res;
        // console.log(this.data.html);
        this.hp = new HTMLParser(this.data.html.content);
        // this.ui.message('HTML FINISHED');

        return this.setupAdditionalContent();
      });
    } else
      return Promise.resolve(100); // Status 100 CONTINUE
  }


  // INFO: HELPERS


  /**
   * Iterator function to synchronize Promises
   * @param {Array} array
   * @param {Function} fn
   */
  processMultipleItems(array, fn) {
    const self = this;
    var results = [];
    if (array.length !== 0) {
      return array.reduce((p, item) => {
        return p.then(() => {
          return fn(item).then((data) => {
            self.ui.message({
              verbose: chalk.dim('-> ' + item.url)
            }, {
              code: data.statusCode,
              msg: data.statusMessage
            }, false);
            results.push(data);
            return results;
          });
        });
      }, Promise.resolve());
    } else
      return Promise.resolve(404);
  }


  /**
   * Loads an external (CSS or JS) file
   * @param {URL} item
   */
  loadExternalItem(item) {
    return new Promise(resolve => {
      const Obj = {};
      Obj.url = item.url;
      got(item.url).then(
        res => {
          Obj.headers = res.headers;
          Obj.content = res.body;
          Obj.statusCode = res.statusCode;
          Obj.statusMessage = res.statusMessage;
          resolve(Obj);
        },
        reason => {
          Obj.statusCode = reason.statusCode;
          Obj.statusMessage = reason.statusMessage;
          resolve(Obj);
        });
    });
  }


  /**
   * Checks if the URL is valid and upgrades the protocol if needed
   * @class Tasks
   */
  normalizeURL() {
    let url = this.url;

    this.ui.message({
      normal: 'Checking the URL ...',
      verbose: 'Checking the URL ' + chalk.yellow(url)
    });

    url = url.replace(/(https?:)?\/\//, ''); // delete the protocol
    url = (url.startsWith('/')) ? url.substr(1) :
      url; // get rid of trailing slash
    url = (url.endsWith('/')) ? url :
      url + '/'; // ensure that it ends with a slash
    // upgrade protocol if needed
    return got('http://' + url, this.default_headers).then(res => {
      url = (url != res.url) ? res.url : url;
      this.data.html = {
        url: new URL(url)
      };
      if (this.url !== this.data.html.url.href) {
        this.ui.message({
          verbose: 'URL ' + chalk.yellow(this.url) + ' was adjusted to ' +
            chalk.yellow(this.data.html.url.href) + '.'
        });
      }
      this.remove('normalize');
      Promise.resolve(200);
    });
  }
}

module.exports = Tasks;