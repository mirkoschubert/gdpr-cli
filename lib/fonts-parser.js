'use strict';

const URL = require('url').URL;

class FontsParser {

  constructor(css, js, localUrl) {
    this.localUrl = localUrl;
    this.css = css || [];
    this.js = js || [];

    this.fonts = {};
  }

  /**
   * Main Function, returns an Fonts Object
   * @class FontsParser
   */
  getFonts() {
    if (this.hasAutoptimize()) this.fonts = this.getAutoptimizeFonts()

    if (this.hasLocalFonts()) this.fonts.local = this.getLocalFonts();
    if (this.hasWordPressFonts()) this.fonts.wordpress = this.getWordPressFonts();
    if (this.hasGoogleFonts()) this.fonts.google = this.getGoogleFonts();

    if (this.hasTypekitJS() || this.hasTypekitCSS()) this.fonts.typekit = [];
    if (this.hasTypekitJS()) this.getTypekitJSFonts().forEach(f => this.fonts.typekit.push(f));
    if (this.hasTypekitCSS()) this.getTypekitCSSFonts().forEach(f => this.fonts.typekit.push(f));

    return this.fonts;
  }

  // INFO: Features 

  hasAutoptimize() {
    let ao = false;
    this.css.forEach(el => {
      if (el.url.href.indexOf('/wp-content/cache/autoptimize/css/') !== -1) ao = true;
    });
    return ao;
  }

  getAutoptimizeFonts() {
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
            font.type = this.getFontType(ff, this.localUrl);
            font.url = el.url;

            fonts.push(font);
          });
        }
      }
    });
    return this.sortFonts(this.removeDuplicates(fonts));
  }

  hasLocalFonts() {
    let lf = false;
    this.css.forEach(el => {
      if (el.url.host === this.localUrl.host && el.content.indexOf('@font-face') !== -1) lf = true;
    });
    this.css.inline.forEach(el => {
      if (el.indexOf('@font-face') !== -1) {
        let fontfaces = el.match(/\@font-face\s?{([^}]*)/gm);
        if (fontfaces !== null) {
          fontfaces.forEach(ff => {
            if (this.getFontType(ff) === 'local') lf = true;
          });
        }
      }
    });
    return lf;
  }

  getLocalFonts() {
    let fonts = [];

    this.css.forEach(el => {
      if (el.url.host === this.localUrl.host) {
        let fontfaces = el.content.match(/\@font-face\s?{([^}]*)/gm);
        if (fontfaces !== null) {
          fontfaces.forEach(ff => {
            if (this.getFontType(ff) === 'local') {
              let font = {};
              font.font = this.getFontName(ff);
              if (this.getFontStyle(ff) !== '') font.style = this.getFontStyle(ff);
              if (this.getFontWeight(ff) !== '') font.weight = this.getFontWeight(ff);
              font.type = 'local';
              font.url = el.url;
              fonts.push(font);
            }
          });
        }
      }
    });
    this.css.inline.forEach(el => {
      let fontfaces = el.match(/\@font-face\s?{([^}]*)/gm);
      if (fontfaces !== null) {
        fontfaces.forEach(ff => {
          if (this.getFontType(ff) === 'local') {
            let font = {};
            font.font = this.getFontName(ff);
            if (this.getFontStyle(ff) !== '') font.style = this.getFontStyle(ff);
            if (this.getFontWeight(ff) !== '') font.weight = this.getFontWeight(ff);
            font.type = 'local';
            font.url = el.url;
            fonts.push(font);
          }
        });
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
    return this.removeDuplicates(fonts);
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
        let fontfaces = el.content.match(/\@font-face\s?{([^}]*)/gm);
        if (fontfaces !== null) {
          fontfaces.forEach(ff => {
            let font = {};
            font.font = this.getFontName(ff);
            if (this.getFontStyle(ff) !== '') font.style = this.getFontStyle(ff);
            if (this.getFontWeight(ff) !== '') font.weight = this.getFontWeight(ff);
            font.type = 'google';
            font.url = el.url;
            fonts.push(font);
          });
        }
      }
    });
    return this.removeDuplicates(fonts);
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
        let fontfaces = el.content.match(/\@font-face\s?{([^}]*)/gm);
        if (fontfaces !== null) {
          fontfaces.forEach(ff => {
            let font = {};
            font.font = this.getFontName(ff);
            if (this.getFontStyle(ff) !== '') font.style = this.getFontStyle(ff);
            if (this.getFontWeight(ff) !== '') font.weight = this.getFontWeight(ff);
            font.type = 'typekit';
            font.url = el.url;
            fonts.push(font);
          });
        }
      }
    });
    return this.removeDuplicates(fonts);
  }

  hasTypekitJS() {
    let tk = false;
    this.js.forEach(js => {
      if (js.url.href.indexOf('use.typekit.net') !== -1) tk = true;
    });
    return tk;
  }

  getTypekitJSFonts() {
    let fonts = [];
    this.js.forEach(js => {
      if (js.url.href.indexOf('use.typekit.net') !== -1) {
        let conf = JSON.parse(js.content.match(/window.Typekit.config\s?\=\s?([^;]*)/)[1]);
        conf.fc.forEach(f => {
          let font = {};
          font.font = f.family;
          font.style = f.descriptors.style;
          font.weight = f.descriptors.weight;
          font.source = 'typekit'
          fonts.push(font);
        });
      }
    });
    return this.removeDuplicates(fonts);
  }


  // INFO: RegEx functions

  /**
   * Gets the name of the font
   * @param {string} fontface
   * @class FontsParser
   */
  getFontName(fontface) {
    return fontface.match(/font\-family\:\s?['"]?([^'";]*)/)[1];
  }


  /**
   * Gets the style of the font
   * @param {string} fontface 
   * @class FontsParser
   */
  getFontStyle(fontface) {
    let style = '';
    if (fontface.match(/font\-style\:\s?['"]?([^'";]*)/) !== null)
      style = fontface.match(/font\-style\:\s?['"]?([^'";]*)/)[1];
    return style;
  }


  /**
   * Gets the weight of the font
   * @param {string} fontface 
   * @class FontsParser
   */
  getFontWeight(fontface) {
    let weight = '';
    if (fontface.match(/font\-weight\:\s?['"]?([^'";]*)/) !== null)
      weight = fontface.match(/font\-weight\:\s?['"]?([^'";]*)/)[1];
    if (weight === 'normal') weight = '400';
    if (weight === 'bold') weight = '700';
    return weight;
  }


  /**
   * Gets the font type
   * @param {string} fontface 
   * @param {URL} localUrl 
   * @class FontsParser
   */
  getFontType(fontface) {
    let type = '';
    let url = fontface.match(/url\(['"]?([^'"\)]*)/)[1];
    url = (url.startsWith('//')) ? this.localUrl.protocol + url : url;
    if (url.startsWith('http')) {
      let Url = new URL(url);
      if (Url.host === this.localUrl.host) type = 'local';
      if (Url.host.indexOf('wordpress.com') !== -1) type = 'wordpress';
      if (Url.host.indexOf('fonts.gstatic.com') !== -1) type = 'google';
      if (Url.host.indexOf('use.typekit.net') !== -1) type = 'typekit';
      if (Url.host.indexOf('use.fontawesome.com') !== -1) type = 'awesome';
    } else type = 'local'; // relative url

    return type;
  }

  // INFO: Visual functions 


  /**
   * Shortcut to search for a specific font in a section
   * @param {array} section
   * @param {string} font
   */
  getFontStyles(section, font) {
    let styles = {};
    let output = '';

    section.forEach(f => {
      if (f.font === font) {
        if (typeof f.style !== 'undefined') {
          if (typeof styles[f.style] === 'undefined') styles[f.style] = [];
          styles[f.style].push(f.weight);
        }
      }
    });
    for (let style in styles) {
      output += style + ' (' + styles[style].join(', ') + ') ';
    }
    return output;
  }


  // INFO: helper functions 

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


  /**
   * Sorts fonts by type
   * @param {array} fonts 
   * @returns {object} sorted
   * @class FontsParser
   */
  sortFonts(fonts) {
    const types = ['local', 'wordpress', 'google', 'typekit', 'awesome'];
    let sorted = {};
    fonts.forEach(font => {
      if (types.indexOf(font.type) !== -1) {
        if (typeof sorted[font.type] === 'undefined') {
          sorted[font.type] = [];
          sorted[font.type].push(font);
        } else sorted[font.type].push(font);
      }
    });
    return sorted;
  }


  /**
   * Revove duplicates from an Fonts-Array
   * @param {array} arr
   * @class FontsParser
   */
  removeDuplicates(arr) {
    return arr
      .reduce(
        function (p, c) {
          var id = [c.font, c.style, c.weight, c.type].join('|');

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

module.exports = FontsParser;
