'use strict';

const URL = require('url').URL;
const css = require('css');

class CSSParser {
  constructor(css) {
    this.css = css;
    // console.log(css);
  }

  getAllCSSFonts() {

  }

  hasAutoptimize() {
    let ao = false;
    this.css.forEach(el => {
      if (el.url.href.indexOf('/wp-content/cache/autoptimize/css/') !== -1) ao = true;
    });
    return ao;
  }

  getAutoptimizeFonts(localUrl) {
    let fonts = [];

    this.css.forEach(el => {
      if (el.url.href.indexOf('/wp-content/cache/autoptimize/css/') !== -1) {
        let fontfaces = el.content.match(/\@font-face\s?{([^}]*)/gm);
        if (fontfaces !== null) {
          fontfaces.forEach(ff => {
            let font = {};
            font.font = this.getFontName(ff);
            if (this.getFontStyle(ff) !== '') font.style = this.getFontStyle(ff);
            if (this.getFontWeight(ff) !== '') font.weight = this.getFontWeight(ff);
            font.source = this.getFontType(ff, localUrl);

            fonts.push(font);
          });
        }
      }
    });
    return this.sortFonts(this.removeDuplicates(fonts));
  }

  hasLocalFonts(localUrl) {
    let lf = false;
    this.css.forEach(el => {
      if (el.url.host === localUrl.host && el.content.indexOf('@font-face'))
        lf = true;
    });
    this.css.inline.forEach(el => {
      if (el.indexOf('@font-face') !== -1) lf = true;
    });
    return lf;
  }

  getLocalFonts(localUrl) {
    let fonts = [];

    this.css.forEach(el => {
      if (el.url.host === localUrl.host) {
        let fontfaces = el.content.match(/\@font-face\s?{([^}]*)/gm);
        if (fontfaces !== null) {
          fontfaces.forEach(ff => {
            let isLocal = false;
            if (ff.match(/https?\:\/\//) !== null) {
              let url = new URL(ff.match(/url\(['"]?([^'"\)]*)/)[1]);
              if (url.host === localUrl.host) isLocal = true;
            } else
              isLocal = true;

            if (isLocal) {
              let font = {};
              font.font = ff.match(/font\-family\:\s?['"]?([^'"]*)/)[1];
              if (ff.match(/font\-style\:\s?['"]?([^'";]*)/) !== null)
                font.style = ff.match(/font\-style\:\s?['"]?([^'";]*)/)[1];
              if (ff.match(/font\-weight\:\s?['"]?([^'";]*)/) !== null)
                font.weight = ff.match(/font\-weight\:\s?['"]?([^'";]*)/)[1];
              if (font.weight === 'normal') font.weight = '400';
              font.source = 'local';
              fonts.push(font);
            }
          });
        }
      }
    });
    // TODO: inline CSS
    this.css.inline.forEach(el => {
      if (el.indexOf('@font-face') !== -1) {
        let fontfaces = el.match(/\@font-face\s?{([^}]*)/gm);
        // console.log(el);
      }
    });
    return this.removeDuplicates(fonts);
  }

  hasWordPressFonts() {
    let wf = false;
    this.css.forEach(el => {
      if (el.url.href.match(/s[0-9]?\.wp\.com/) !== null &&
        el.content.match(/\@font\-face/))
        wf = true;
    });
    return wf;
  }

  getWordPressFonts() {
    let fonts = [];
    this.css.forEach(el => {
      if (el.url.href.match(/s[0-9]?\.wp\.com/)) {
        let fontfaces = el.content.match(/\@font-face\s?{([^}]*)/gm);
        if (fontfaces !== null) {
          fontfaces.forEach(ff => {
            ['Noticons', 'Genericons', 'social-logos'].forEach(f => {
              if (ff.indexOf(f) !== -1 &&
                JSON.stringify(fonts).indexOf(f) === -1)
                fonts.push({
                  font: f,
                  source: 'wordpress'
                });
            });
          });
        }
      }
    });
    return fonts;
  }

  hasGoogleFonts() {
    let gf = false;
    this.css.forEach(el => {
      if (el.url.href.indexOf('fonts.googleapis.com') !== -1) gf = true;
    });
    return gf;
  }

  getGoogleFonts() {
    let fonts = [];
    this.css.forEach(el => {
      if (el.url.href.indexOf('fonts.googleapis.com') !== -1) {
        let cssObj = css.parse(el.content);
        cssObj.stylesheet.rules.forEach(rule => {
          if (rule.type === 'font-face') {
            let entry = {};
            rule.declarations.forEach(dec => {
              if (dec.property === 'font-family')
                entry.font = dec.value.replace(/[\'"]/gi, '');
              if (dec.property === 'font-weight') entry.weight = dec.value;
              if (dec.property === 'font-style') entry.style = dec.value;
              entry.source = 'google';
            });
            fonts.push(entry);
          }
        });
      }
    });
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
              if (dec.property === 'font-family')
                entry.font = dec.value.replace(/[\'"]/gi, '');
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

  // INFO: Helpers

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
            if (style !== '')
              output += style + ' (' + weights.join(', ') + ') ';
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

  getFontName(fontface) {
    return fontface.match(/font\-family\:\s?['"]?([^'";]*)/)[1];
  }

  getFontStyle(fontface) {
    let style = '';
    if (fontface.match(/font\-style\:\s?['"]?([^'";]*)/) !== null)
      style = fontface.match(/font\-style\:\s?['"]?([^'";]*)/)[1];
    return style;
  }

  getFontWeight(fontface) {
    let weight = '';
    if (fontface.match(/font\-weight\:\s?['"]?([^'";]*)/) !== null)
      weight = fontface.match(/font\-weight\:\s?['"]?([^'";]*)/)[1];
    if (weight === 'normal') weight = '400';
    if (weight === 'bold') weight = '700';
    return weight;
  }

  getFontType(fontface, localUrl) {
    let type = '';
    let url = fontface.match(/url\(['"]?([^'"\)]*)/)[1];
    url = (url.startsWith('//')) ? localUrl.protocol + url : url;
    // TODO: relative urls
    let Url = new URL(url);
    if (Url.host === localUrl.host) type = 'local';
    if (Url.host.indexOf('wordpress.com') !== -1) type = 'wordpress';
    if (Url.host.indexOf('fonts.gstatic.com') !== -1) type = 'google';
    if (Url.host.indexOf('use.typekit.net') !== -1) type = 'typekit';
    if (Url.host.indexOf('use.fontawesome.com') !== -1) type = 'awesome';

    return type;
  }

  sortFonts(fonts) {
    const types = ['local', 'wordpress', 'google', 'typekit', 'awesome'];
    let sorted = {};
    fonts.forEach(font => {
      if (types.indexOf(font.source) !== -1) {
        if (typeof sorted[font.source] === 'undefined') {
          sorted[font.source] = [];
          sorted[font.source].push(font);
        } else sorted[font.source].push(font);
      }
    });
    return sorted;
  }

  /**
   * Revove duplicates from an Fonts-Array
   * @param {array} arr
   */
  removeDuplicates(arr) {
    return arr
      .reduce(
        function (p, c) {
          var id = [c.font, c.style, c.weight, c.source].join('|');

          if (p.temp.indexOf(id) === -1) {
            p.out.push(c);
            p.temp.push(id);
          }
          return p;
        }, {
          temp: [],
          out: []
        })
      .out;
  }
}

module.exports = CSSParser;