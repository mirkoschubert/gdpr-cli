'use strict';

const cheerio = require('cheerio');


function isWordPress(info) {
  return info.generators.some(gen => {
    return gen.toLowerCase().indexOf('wordpress') !== -1 || gen.toLowerCase().indexOf('wpml') !== -1;
  });
}


function getInfo(data) {

  const $ = cheerio.load(data.html.content);
  let info = {};

  // Title
  info.title = $('title').text();
  if (typeof info.title !== 'string' || info.title === '') {
    $('meta').each((i, el) => {
      if (el.attribs.property === 'og:title') info.title = el.attribs.content;
    });
  }

  // Description
  info.description = '';
  $('meta').each((i, el) => {
    if (el.attribs.name === 'description') info.description = el.attribs.content;
    if (info.description === '' && el.attribs.property === 'og:description') info.description = el.attribs.content;
  });

  // URL
  info.url = data.html.url.href;

  // Software / Generator
  let generators = [];
  $('meta').each((i, el) => {
    if (el.attribs.name === 'generator') generators.push(el.attribs.content);
  });
  if (generators.length === 0) {
    for (const css of data.css) {
      if (css.url.href.indexOf('wp-content') !== -1 || css.url.href.indexOf('wp-includes') !== -1) {
        generators.push('WordPress');
        break;
      }
    }
  }
  info.generators = generators;

  // Optional: WordPress Theme
  if (isWordPress(info)) {

    // Theme
    data.css.forEach(css => {
      const match = css.url.href.match(/themes\/(.*?)\/style\.css/);
      if (match !== null) {
        info.theme = match[1];
        info.theme = info.theme.charAt(0).toUpperCase() + info.theme.slice(1); // Capitalize
      };
    });

    // Plugins
    let pl = [];
    data.css.forEach(css => {
      const match = css.url.href.match(/plugins\/([^\/]*)/);
      if (match !== null) {
        let words = match[1].split('-');
        words.forEach((word, i) => {
          words[i] = word.charAt(0).toUpperCase() + word.slice(1); // Capitalize
        });
        pl.push(words.join(' '));
      }
    });
    if (pl.length > 0) info.plugins = pl;
  }

  return info;
}

module.exports = {
  isWordPress,
  getInfo
};