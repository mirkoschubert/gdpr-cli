'use strict';

const got = require('got');
const cheerio = require('cheerio');
const css = require('css');

class Parser {

  constructor() {
    this.html = '';
    this.$ = {};
    this.data = {};
    //this.data.stylesheets = this.getStylesheetURLs();
    //this.data.prefetching = this.checkPrefetching();
  }

  loadHTML(url) {
    return new Promise((resolve, reject) => {
      got(url).then(res => {
        this.html = res.body;
        this.$ = cheerio.load(this.html);
        resolve(this.getStylesheetURLs());
      }).catch(err => {
        reject(err);
      });
    });
  }

  loadCSS(url) {

  }

  loadJS(url) {

  }

  getMetaData() {
    let metatags = {};
    this.$('meta').each((id, el) => {
      const key = Object.keys(el.attribs).find((attr) => ['name', 'property', 'itemprop', 'http-equiv'].indexOf(attr) !== -1);
      const name = el.attribs[key];
      const value = el.attribs['content'];
      if (!metatags[name]) {
        metatags[name] = [];
      }
      metatags[name].push(value);
    });
    return metatags;
  }

  findFonts() {

  }

  getStylesheetURLs() {
    let stylesheetURLs = [];
    this.$('link').each((id, el) => {
      if (el.attribs.rel === 'stylesheet' && el.attribs.type === 'text/css') stylesheetURLs.push(el.attribs.href);
    });
    return stylesheetURLs;
  }

  checkPrefetching() {
    let prefetching = [];
    this.$('link').each((id, el) => {
      if (el.attribs.rel === 'dns-prefetch') prefetching.push(el.attribs.href);
    });
    return prefetching;
  }

  checkImages() {

  }
}

module.exports = Parser;