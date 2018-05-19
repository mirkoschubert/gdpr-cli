'use strict';

const cheerio = require('cheerio');

class HTMLParser {

  constructor(html) {
    this.html = html;
    this.$ = cheerio.load(this.html);
  }

  getStylesheetURLs() {
    let stylesheetURLs = [];
    this.$('link').each((id, el) => {
      if (el.attribs.rel === 'stylesheet' && el.attribs.type === 'text/css') stylesheetURLs.push(el.attribs.href);
    });
    return stylesheetURLs;
  }

  getJavascriptURLs() {
    let javascriptURLs = [];
    this.$('script').each((id, el) => {
      if (el.attribs.type === 'text/javascript' && typeof el.attribs.src !== 'undefined') javascriptURLs.push(el.attribs.src);
    });
    return javascriptURLs;
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

  checkPrefetching() {
    let prefetching = [];
    this.$('link').each((id, el) => {
      if (el.attribs.rel === 'dns-prefetch') prefetching.push(el.attribs.href);
    });
    return prefetching;
  }

}

module.exports = HTMLParser;