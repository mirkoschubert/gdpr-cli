'use strict';

const cheerio = require('cheerio');

class Parser {

  constructor(html) {
    this.html = html;
    this.$ = cheerio.load(this.html);
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
}

module.exports = Parser;