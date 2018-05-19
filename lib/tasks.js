'use strict';

const got = require('got');
const chalk = require('chalk');
const HTMLParser = require('./html-parser');
const CSSParser = require('./css-parser');
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
      fonts: {
        dependencies: ['html', 'css']
      },
      prefetching: {
        dependencies: ['html']
      }
    };
    this.tasks = [];
    this.urls = {};
    this.urls.html = url || 'https://google.com';
    this.urls.css = [];
    this.urls.js = [];
    this.html = '';
    this.css = [];
    this.js = [];

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
   * Runs the Task Manager
   * @class Tasks
   */
  run() {

    // if no tasks specified do it all
    if (this.tasks.length === 0) {
      for (const t in this.default_tasks) {
        this.tasks.push(t)
      }
    }
    console.log(this.tasks);

    if (this.tasks.indexOf('html') !== -1) {

      this.ui.message({
        silent: '',
        normal: 'Loading HTML file ...',
        verbose: 'Loading ' + chalk.yellow(this.urls.html) + '...'
      });

      this.loadContent(this.urls.html)
        .then(html => {
          this.html = html;
          this.hp = new HTMLParser(this.html);
          return this.setupAdditionalContent();
        })
        .then(() => (this.tasks.indexOf('css') != -1) ? this.loadCSSfiles() : [])
        .then(() => (this.tasks.indexOf('js') != -1) ? this.loadJSfiles() : [])
        .then((js) => {
          console.log('EVERYTHING ELSE');
        })
        .catch(err => {
          this.ui.error(err.message);
        });
    }
  }


  /**
   * Finds CSS and JS references in the HTML file
   * @class Tasks
   */
  setupAdditionalContent() {

    this.ui.message('Setup additional content');
    if (this.tasks.indexOf('css') != -1) {
      this.ui.message({
        silent: '',
        normal: '',
        verbose: chalk.dim('-> CSS files')
      }, '', false);
      this.urls.css = this.hp.getStylesheetURLs();
    }
    if (this.tasks.indexOf('js') != -1) {
      this.ui.message({
        silent: '',
        normal: '',
        verbose: chalk.dim('-> JavaScript files')
      }, '', false);
      this.urls.js = this.hp.getJavascriptURLs();
    }
    return Promise.resolve(this.urls);
  }


  /**
   * Gets any external CSS content
   * @class Tasks
   */
  loadCSSfiles() {

    this.ui.message('Load CSS Files')
    let promises = this.urls.css.map(url => {
      this.ui.message({
        silent: '',
        normal: '',
        verbose: chalk.dim('-> ' + url)
      }, '', false);
      this.loadContent(url)
    });
    return Promise.all(promises).then(cssArray => cssArray);
  }


  /**
   * Gets any external JS content
   * @class Tasks
   */
  loadJSfiles() {

    this.ui.message('Load JavaScript files');
    let promises = this.urls.js.map(url => {
      this.ui.message({
        silent: '',
        normal: '',
        verbose: chalk.dim('-> ' + url)
      }, '', false);
      this.loadContent(url)
    });
    return Promise.all(promises).then(cssArray => cssArray);
  }


  /**
   * Loads external HTML, CSS und JS files
   * @param {string} url 
   * @class Tasks
   */
  loadContent(url) {
    return got(url).then(res => res.body);
  }

}

module.exports = Tasks;