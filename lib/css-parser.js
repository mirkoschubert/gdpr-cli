'use strict';

const css = require('css');

class CSSParser {

  constructor(css) {
    this.css = css;
    //console.log(css);
  }

  hasAutoptimize() {

  }


  /**
   * Parses every previously loaded CSS file for @font-face entries
   * @class CSSParser
   */
  getFonts() {

    let fonts = {};

    if (Array.isArray(this.css)) {
      this.css.forEach(el => { // go through every file
        let cssObj = css.parse(el.content); // get file content parsed
        cssObj.stylesheet.rules.forEach(rule => {
          if (rule.type === 'font-face') { // for every font-face do
            let entry = {};

            rule.declarations.forEach(dec => { // go through every declaration of a font-face
              if (dec.property === 'font-family') entry.font = dec.value.replace(/[\'"]/gi, ''); // unescaped font-family
              if (dec.property === 'font-weight') entry.weight = dec.value;
              if (dec.property === 'font-style') entry.style = dec.value;
              if (dec.property === 'src') {

                if (dec.value.indexOf('base64,') !== -1) dec.value = dec.value.replace('base64,', 'base64'); // Base64 fix
                const urldata = dec.value.split(',');
                const grades = ['local', 'inline', 'internal', 'external', 'wordpress', 'google'];
                entry.source = '';

                urldata.forEach(f => { // go through every entry

                  if (f.indexOf('local(') === -1) {
                    let src = '';
                    if (f.indexOf('data:application') === -1) {
                      src = (f.match(/(https?:)?\/\//) !== null) ? 'external' : 'internal';
                      if (f.indexOf('fonts.gstatic.com') !== -1) src = 'google';
                      if (f.indexOf('wordpress.com') !== -1) src = 'wordpress';
                      if (el.url.host.indexOf('use.fontawesome') !== -1 || f.indexOf('use.fontawesome.com') !== -1) src = 'fontawesome';
                      if (el.url.host.indexOf('use.typekit.net') !== -1 || f.indexOf('use.typekit.net') !== -1) src = 'typekit';
                    } else src = 'inline';

                    if (entry.source !== '') {
                      if (grades.indexOf(entry.source) < grades.indexOf(src)) entry.source = src;
                    } else entry.source = src;
                  } else {
                    console.log(f);
                  }
                });
              }
            });
            if (typeof fonts[entry.source] === 'undefined') fonts[entry.source] = [];
            let similar = false;
            fonts[entry.source].forEach(en => {
              if (JSON.stringify(en) === JSON.stringify(entry)) similar = true;
            });
            if (!similar) fonts[entry.source].push(entry);
          }
        });
      });
    }
    return fonts;
  }


  hasTypekitCSS() {
    let tk = false;
    this.css.forEach(el => {
      if (el.url.href.indexOf('use.typekit.net') !== -1) tk = true;
    });
    return tk;
  }


  getTypekitCSSFonts() {
    let fonts = [];
    this.css.forEach(el => {
      if (el.url.href.indexOf('use.typekit.net') !== -1) {
        let cssObj = css.parse(el.content);
        cssObj.stylesheet.rules.forEach(rule => {
          if (rule.type === 'font-face') {
            let entry = {};
            rule.declarations.forEach(dec => {
              if (dec.property === 'font-family') entry.font = dec.value.replace(/[\'"]/gi, '');
              if (dec.property === 'font-weight') entry.weight = dec.value;
              if (dec.property === 'font-style') entry.style = dec.value;
              entry.source = 'typekit';
            });
            fonts.push(entry);
          }
        });
      }
    });
    return fonts;
  }


  /**
   * Shortcut to search for a specific font in a section 
   * @param {array} section 
   * @param {string} font 
   */
  getFontStyles(section, font) {

    let style = '';
    let weights = [];
    let output = '';

    section.forEach(f => {
      if (f.font === font) {
        if (typeof f.style !== 'undefined') {
          if (f.style !== style) {
            if (style !== '') output += style + ' (' + weights.join(', ') + ') ';
            style = f.style;
            weights = [];
          }
          weights.push(f.weight);
        }
      }
    });
    if (weights.length > 0) output += style + ' (' + weights.join(', ') + ') ';

    return output;
  }


  /**
   * Counts and lists all fonts of a specific section
   * @param {array} section 
   */
  countFonts(section) {

    let fonts = [];
    section.forEach(f => {
      if (fonts.indexOf(f.font) === -1) fonts.push(f.font);
    });
    return fonts;
  }

}

module.exports = CSSParser;