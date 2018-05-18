'use strict';

const css = require('css');

class CSSParser {

  constructor(css) {
    this.css = css;
  }

  checkFonts() {
    let fonts = [];
    if (Array.isArray(this.css)) {
      this.css.forEach(el => {
        let cssObj = css.parse(el);
        cssObj.stylesheet.rules.forEach(rule => {
          if (rule.type === 'font-face') {
            //console.log(rule);
            let font = {};
            font.sources = [];
            rule.declarations.forEach(dec => {
              if (dec.property === 'font-family') font.family = dec.value.replace(/\'/gi, '');
              if (dec.property === 'font-weight') font.weight = dec.value;
              if (dec.property === 'font-style') font.style = dec.value;
              if (dec.property === 'src') {
                //console.log(dec);
                if (dec.value.indexOf('base64') !== -1) {
                  font.sources.push('inline');
                } else if (dec.value.match(/(https?\:)?(\/\/)/g) !== null) {
                  font.sources.push((dec.value.match(/(https?\:)?(\/\/)(fonts.gstatic)/g) !== null) ? 'google' : 'external');
                } else {
                  font.sources.push('internal');
                }
              }
              fonts.push(font);
            })
          }
        });
      });
    } else {

    }
    console.log(fonts);
  }

}

module.exports = CSSParser;