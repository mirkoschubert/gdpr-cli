'use strict';

const URL = require('url').URL; // for backwards compability (node < 10)
const got = require('got');
const chalk = require('chalk');
const sslCert = require('get-ssl-certificate');
const HTMLParser = require('./html-parser');
const FontsParser = require('./fonts-parser');
// const tools = require('./tools');
const UI = require('./ui');
const Cookies = require('./cookies');
const RecommendationCollection = require('./recommendation-collection');

class Tasks {
  constructor(url, uiInstance, args) {
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
      general: {
        dependencies: ['html', 'css', 'js'],
        mandatory: true
      },
      audit: {
        dependencies: [],
      },
      nfz: {
        dependencies: [],
      },
      cookies: {
        dependencies: ['html', 'css']
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
      },
      cdn: {
        dependencies: ['html', 'css', 'js']
      },
      social: {
        dependencies: ['html', 'css', 'js']
      }
    };

    this.default_headers = {
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36'
    }

    // Classes implementation
    this.ui = (!uiInstance) ? new UI() : uiInstance;
    this.hp;

    this.args = args;
    this.url = url;
    this.tasks = [];
    this.data = {};
    this.recommendations = new RecommendationCollection();

    // Put mandatory tasks already in the task list
    this.tasks = this.tasks.concat(this.getMandatoryTasks());
  }


  /**
   * Adds a new Task to the list
   * @param {string} task
   * @param {string} arg value
   * @class Tasks
   */
  new(task, value) {
    this.default_tasks[task].dependencies.forEach(dep => {
      if (this.tasks.indexOf(dep) === -1) this.tasks.push(dep);
    });
    if (this.tasks.indexOf(task) === -1) this.tasks.push(task);
    if ( value !== undefined ) this.value = value;
  }


  /**
   * Removes a Task from the list
   * @param {string} task
   * @class Tasks
   */
  remove(task) {
    if (this.tasks.indexOf(task) !== -1) {
      this.tasks.splice(this.tasks.indexOf(task), 1);
    }
  }


  /**
   * Removes a Task from the list and launch ending actions
   * @param {string} task
   * @class Tasks
   */
  end(task) {
    this.remove(task);
    if ( this.tasks.length > 1 ) return;
    this.getAuditInformations();
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
      if (this.default_tasks[task].mandatory) {
        this.default_tasks[task].dependencies.forEach(dep => {
          if (t.indexOf(dep) === -1) t.push(dep);
        });
        t.push(task);
      }
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
      for (const t in this.default_tasks) this.new(t);
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
    console.log('');
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
          this.getNFZInformations();
          this.getSSLInformation();
          this.getFontInformation();
          this.getSocialMediaInformation();
          this.getPrefetchingInformation();
          this.getAnalyticsInformation();
          this.getCDNInformation();
          this.getCookiesInformation();
          this.getAuditInformations();

          console.log('');
          // console.log('Remaining: ', this.tasks);
        })
        .catch(e => console.log(e.message));
    }
  }


  // INFO: Content Creation


  getSocialMediaInformation() {

    if (this.hasTask('social')) {

      const social = require('./social');
      this.data.social.fb_connect = social.hasFacebookConnect(this.data.js);
      this.data.social.fb_graph = social.hasFacebookSocialGraph(this.data.js);
      this.data.social.pinterest = social.hasPinterest(this.data.js);

      this.ui.headline('Social Medias');
      
      for ( var sm in this.data.social ) {
        if ( !this.data.social[sm] ) continue;
        this.recommendations.add('Social medias', sm);
      }

      if ( this.data.social.fb_connect ) this.ui.listitem('Facebook', 'Connect');
      if ( this.data.social.fb_graph ) this.ui.listitem('Facebook', 'Graph');
      if ( this.data.social.pinterest ) this.ui.listitem('Pinterest', '');

      this.end('social');
    }
  }


  getCDNInformation() {
    if (this.hasTask('cdn')) {
      const cdns = require('../data/cdn.json');
      // gather information
      let found = [];
      cdns.forEach(cdn => {
        this.data.css.forEach(css => {
          if (css.url.href.indexOf(cdn.host) !== -1) found.push(cdn);
        });
        this.data.js.forEach(js => {
          if (js.url.href.indexOf(cdn.host) !== -1) found.push(cdn);
        });
      });
      // Remove Duplicates
      found = found.filter((el, i) => {
        return found.indexOf(el) === i;
      });
      // Formatted Output
      this.ui.headline('Content Delivery Networks');
      this.ui.settable({
        cells: 3,
        widths: [5, 30, 0]
      });
      if (found.length > 0) {
        this.ui.info(chalk.yellow(this.data.html.url.hostname) + ' uses ' + chalk.red(found.length) + ' Content Delivery Networks.\n');
        found.forEach((cdn, i) => {
          this.ui.tableitem(
            [chalk.yellow(String(i + 1) + '.'), cdn.host, chalk.dim(cdn.description)]
          );
        });
        this.recommendations.add('Third Party', 'Content Delivery Networks');
      } else this.ui.info('No Content Delivery Networks have been found.');
      
      this.end('cdn');
    }
  }


  getAnalyticsInformation() {
    if (this.hasTask('analytics')) {
      const analytics = require('./analytics');
      if (analytics.hasGoogleAnalytics(this.data.js)) this.data.analytics.ga = analytics.getGoogleAnalyticsDetails(this.data.js);
      if (analytics.hasGoogleTagManager(this.data.js)) this.data.analytics.gtag = analytics.getGoogleTagManagerDetails(this.data.js);
      if (analytics.hasPiwik(this.data.js)) this.data.analytics.piwik = analytics.getPiwikDetails(this.data.js);
      if (analytics.hasWordPressStats(this.data.js)) this.data.analytics.wordpress = true;
      //console.log(this.data.analytics);

      this.ui.headline('Analytics');
      if (typeof this.data.analytics.ga === 'undefined' && typeof this.data.analytics.gtag === 'undefined' &&
        typeof this.data.analytics.piwik === 'undefined' && typeof this.data.analytics.wordpress === 'undefined') {
        this.ui.info('No Analytics Tool has been found.');
        this.end('analytics');
        return;
      }

      if (typeof this.data.analytics.ga !== 'undefined') {
        this.ui.info(chalk.red('Google Analytics') + ' has been found.\n');
        this.ui.listitem('Property ID', this.data.analytics.ga.property_id);
        this.ui.listitem('Anonymized IP', (this.data.analytics.ga.anonymize_ip) ? 'Yes' : 'No');
        this.ui.listitem('Force SSL', (this.data.analytics.ga.force_ssl) ? 'Yes' : 'No');

        if (this.data.analytics.ga.type === 'legacy') this.ui.info('\n' + chalk.red('Warning!') + ' ' + chalk.yellow(this.data.html.url.host) + ' uses the legacy ga.js code snippet (deprecated).');
      }
      if (typeof this.data.analytics.gtag !== 'undefined') {
        this.ui.info(
          'The ' + chalk.red('Google Tag Manager') + ' has been found.\n');
        this.ui.listitem('Property ID', this.data.analytics.gtag.property_id);
        this.ui.listitem('Anonymized IP', (this.data.analytics.gtag.anonymize_ip) ? 'Yes' : 'No');
      }
      if (typeof this.data.analytics.piwik !== 'undefined') {
        this.ui.info(chalk.red('Matomo') + ' has been found.\n');
        this.ui.listitem('Matomo URL', this.data.analytics.piwik.url);
        this.ui.listitem('Site ID', this.data.analytics.piwik.site_id);
      }
      if (typeof this.data.analytics.wordpress !== 'undefined') {
        this.ui.info(
          'The ' + chalk.red('WordPress Stats') +
          ' (Jetpack) has been found.');
      }

      this.recommendations.add('Third party', 'analytics - web statistics');
      this.end('analytics');
    }
  }

  getPrefetchingInformation() {
    if (this.hasTask('prefetching')) {
      const dns = this.hp.checkPrefetching();

      this.ui.headline('DNS Prefetching');

      if (dns.length === 0) {
        this.ui.info(
          chalk.yellow(this.data.html.url.hostname) +
          ' supports no DNS prefetching.');
        this.end('prefetching');
        return;
      }
      
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

        if (u.indexOf('fonts.googleapis.com') >= 0) explanation = 'Google Fonts';
        if (u.indexOf('gravatar.com') >= 0) explanation = 'Automattic Gravatar Service';
        if (u.indexOf('s.w.org') >= 0) explanation = 'WordPress Emojis CDN';
        if (u.match(/s[0-9]\.wp\.com/)) explanation = 'WordPress Styles CDN';
        if (u.match(/i[0-9]\.wp\.com/)) explanation = 'WordPress Images CDN';
        if (u.match(/v[0-9]\.wordpress\.com/)) explanation = 'WordPress Videos CDN';
        if (u.indexOf('maxcdn.bootstrapcdn.com') >= 0) explanation = 'Bootstrap CDN';
        if (u.indexOf('checkout.stripe.com') >= 0) explanation = 'Stripe Online Payments';
        if (u.indexOf('code.jquery.com') >= 0) explanation = 'jQuery CDN';
        if (u.indexOf('translate.google.com') >= 0) explanation = 'Google Translate';
        if (u.indexOf('use.typekit.net') >= 0) explanation = 'Adobe Typekit Web Fonts';
        if (u.indexOf('use.fontawesome.com') >= 0) explanation = 'Font Awesome CDN';

        this.ui.tableitem(
          [chalk.yellow(String(i + 1) + '.'), u, chalk.dim(explanation)])
      });
      this.recommendations.add('Third party', 'DNS Prefetching');

      this.end('prefetching');
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
      const Fonts = new FontsParser(this.data.css, this.data.js, this.data.html.url);
      this.data.fonts = Fonts.getFonts();

      let todo = [];
      default_types.forEach(el => {
        if (typeof this.data.fonts[el.type] !== 'undefined') todo.push(el);
      });

      this.ui.headline('Fonts Implementation');
      this.ui.settable({
        cells: 3,
        widths: [5, 30, 0]
      });

      if (todo.length !== 0) {
        var reco = false;
        todo.forEach((el, i) => {
          let count = Fonts.countFonts(this.data.fonts[el.type]);
          if (i > 0) console.log('');
          this.ui.info(el.decription + ': ' + chalk.red(count.length) + '\n');
          count.forEach((f, j) => {
            this.ui.tableitem([chalk.yellow(String(j + 1) + '.'), f, chalk.dim(Fonts.getFontStyles(this.data.fonts[el.type], f))]);
          });
          if ( el.type != 'local' ) reco = true;
        });
        if ( reco ) this.recommendations.add('Third party', 'fonts');
      } else this.ui.info('There were no Fonts found.');

      this.end('fonts');
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
        this.recommendations.add('Security', 'available SSL certificate (it is mandatory that data is transmitted loud & clear)');
        this.end('ssl');
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
        this.end('ssl');
      }
    }
  }


  /**
   * Gathers Cookies Information
   * @class Tasks
   */
  getCookiesInformation() {
    if (!this.hasTask('cookies')) {
        return;
    }

    var raw_cookies = [],
        waitfor = [];
    
    this.args.cookies = parseInt(this.args.cookies,10) ? parseInt(this.args.cookies,10) : 13;

    // direct cookies
    if (typeof this.data.html.headers['set-cookie'] == 'object') {
      raw_cookies.push(this.data.html.headers['set-cookie']);
    }

    // process JS & CSS
    [this.data.js, this.data.css].forEach(type => {
      type.forEach(data => {
        if (typeof data.headers['set-cookie'] == 'object') {
          raw_cookies.push(data.headers['set-cookie']);
        }
      });
    });

    // process analytics
    if ( this.data.analytics ) {
      for ( var i in this.data.analytics ) {
        waitfor.push('analytics');
        this.loadExternalItem(this.data.analytics[i]).then(res => {
          if (typeof res.headers['set-cookie'] == 'object') {
            raw_cookies.push(res.headers['set-cookie']);
          }
          waitfor.splice(waitfor.indexOf('analytics'), 1);
          this._innerCookies(raw_cookies, waitfor);
        });
      }
    }

    // process fonts
    if ( this.data.fonts ) {
      for ( var i in this.data.fonts ) {
        if ( i == 'local' ) continue;
        waitfor.push('fonts');
        this.data.fonts[i].forEach(font => {
          this.loadExternalItem(font).then(res => {
            if (typeof res.headers['set-cookie'] == 'object') {
              raw_cookies.push(res.headers['set-cookie']);
            }
            waitfor.splice(waitfor.indexOf('fonts'), 1);
            this._innerCookies(raw_cookies, waitfor);
          });
        });
      }
    }
    
    this._innerCookies(raw_cookies, waitfor);
  }

  _innerCookies(raw_cookies, waitfor) {
    // go away if still waiting for async calls
    if ( waitfor.length > 0 ) return;
    
    // go away if no cookie is given
    if ( raw_cookies.length == 0 ) return;

    var getter = new Cookies(raw_cookies);
    var cookies = getter.fetchAll();

    if ( cookies.length == 0 ) {
      this.ui.headline('No cookie set');
      this.end('cookies');
      return;
    }

    var strtotime = require('locutus/php/datetime/strtotime');

    this.ui.headline('Cookies');
    var reco = false;

    for ( var i in cookies ) {
      if ( cookies[i].expires == undefined ) {
        this.ui.listitem(cookies[i].name, 'Expires at the end of the user session and '+(cookies[i].secure ? 'secure' : 'unsecure'));
        continue;
      }
      
      var t1 = cookies[i].expires.getTime(),
          t2 = new Date(strtotime('+'+this.args.cookies+' month 1 hour')*1000).getTime();

      if ( t1 > t2 ) {
        this.ui.listitem(chalk.red(cookies[i].name), 'expires in more than '+this.args.cookies+' month (expires on '+cookies[i].expires.toLocaleDateString()+')', false);
        reco = true;
        continue;
      }

      this.ui.listitem(cookies[i].name, 'Expires on '+cookies[i].expires.toLocaleDateString()+' and '+(cookies[i].secure ? 'secure' : 'unsecure'));
    }
    
    if ( reco ) this.recommendations.add('Cookies', 'expiration delay');
    
    this.end('cookies');
    return;
  }

  /**
   * Gathes further recommendations for further human audit
   * @class Tasks
   */
  getAuditInformations() {
    if (!this.hasTask('audit')) return;

    this.ui.headline('Recommendations for further human audit');

    var topics = this.recommendations.getTopics();
    for ( var i in topics ) {
      var recos = this.recommendations.getWarningsFor(topics[i]);
      recos.forEach(reco => {
          this.ui.listitem(topics[i], 'Check '+reco);
      });
    }
  }
  
  /**
   * Gathes NF Z67-147 informations (meta data) about the audit
   * @class Tasks
   */
  getNFZInformations() {
    if (!this.hasTask('nfz')) return;

    const dns = require('dns');
    const tld = this.url.replace(/^https{0,1}:\/\/([^\/]+)\/.*$/, '$1');
    var tasks = this;

    var w4, w6, a4, a6;
    
    dns.resolve(tld, 'A', function(err, addresses){
      w4 = err !== null ? null : addresses;
      tasks._innerNFZInformations(w4, w6, a4, a6);
    });
    dns.resolve(tld, 'AAAA', function(err, addresses){
      w6 = err !== null ? null : addresses;
      tasks._innerNFZInformations(w4, w6, a4, a6);
    });
    dns.resolve('resolver1.opendns.com', 'A', function(err, addresses){
      dns.setServers(addresses);
      dns.resolve('myip.opendns.com', 'A', function(err, addresses){
        a4 = err !== null ? null : addresses;
        tasks._innerNFZInformations(w4, w6, a4, a6);
      });
      dns.resolve('myip.opendns.com', 'AAAA', function(err, addresses){
        a6 = err !== null ? null : addresses;
        tasks._innerNFZInformations(w4, w6, a4, a6);
      });
    });
  }
  
  _innerNFZInformations(w4, w6, a4, a6) {
    if ( w4 === undefined || w6 === undefined || a4 === undefined || a6 === undefined ) return;
    
    const os = require('os')
    const pkg = require('../package.json');

    this.ui.headline('NF Z67-147 informations about the current audit');

    this.ui.listitem('Operating system', os.type()+' '+os.release()+' '+os.arch());
    this.ui.listitem('Software', pkg.name+'-'+pkg.version+' - '+pkg.description);
    this.ui.listitem('User Agent', this.default_headers['user-agent']);
    this.ui.listitem('Web cache', 'Empty');
    this.ui.listitem('Web cookies', 'Empty');
    this.ui.listitem('Web proxy', 'Null');
    this.ui.listitem('Viruses', os.type() == 'Linux' ? 'Unix system up-to-date and not corrupted' : 'Unverified');
    this.ui.listitem('Date & time', new Date().toLocaleString());

    if ( a4 !== null ) this.ui.listitem("Auditor's IPv4", a4);
    if ( a6 !== null ) this.ui.listitem("Auditor's IPv6", a6);
    if ( w4 !== null ) this.ui.listitem("Website IPv4", w4);
    if ( w6 !== null ) this.ui.listitem("Website IPv6", w6);
  }
  
  /**
   * Gathes General Information (meta data) of the Website
   * @class Tasks
   */
  getGeneralInformation() {

    if (this.hasTask('general')) {
      const info = require('./info');
      this.data.general = info.getInfo(this.data);
      //console.log(this.data.general);

      this.ui.headline('General Information');

      this.ui.listitem('Title', this.data.general.title);
      if (this.data.general.description !== '') this.ui.listitem('Description', this.data.general.description);
      this.ui.listitem('URL', this.data.general.url);
      this.ui.listitem('Software', (this.data.general.generators.length > 0) ? this.data.general.generators.join(', ') : 'Unknown');

      if (info.isWordPress(this.data.general)) {
        if (typeof this.data.general.theme !== 'undefined' && this.data.general.theme !== '') this.ui.listitem('Theme', this.data.general.theme);
        if (typeof this.data.general.plugins !== 'undefined' && this.data.general.plugins.length > 0) this.ui.listitem('Plugins', this.data.general.plugins.join(', '));
      }

      this.end('general');
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
      this.end('html');
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
          this.end('js');
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
          this.end('css');
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
    var tasks = this;
    
    return new Promise(resolve => {
      const Obj = {};
      Obj.url = item.url;

      // manage '^//' URLs adding the default protocol as a prefix
      if ( typeof item.url == 'string' &&
           item.url.replace(/^(\/\/).*$/, '$1') == '//' &&
           tasks.data.html.url !== undefined ) {
        item.url = tasks.data.html.url.protocol + item.url;
      }

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
      this.end('normalize');
      Promise.resolve(200);
    });
  }
}

module.exports = Tasks;

