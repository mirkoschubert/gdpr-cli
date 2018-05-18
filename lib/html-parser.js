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

}

module.exports = HTMLParser;