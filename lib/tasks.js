'use strict';

const Observable = require('zen-observable');
const Listr = require('listr');
const VerboseRenderer = require('listr-verbose-renderer');
const prepare = require('./prepare');
const HTMLParser = require('./html-parser');
const CSSParser = require('./css-parser');


const data = {};

function run(url) {

  data.urls = {};
  data.urls.html = url;
  data.html = '';
  data.css = [];

  const tasks = new Listr([{
    title: 'Load the HTML file',
    task: (ctx, task) => prepare.loadContent(url).then(html => {
      data.html = html;
      const hp = new HTMLParser(html);
      data.urls.css = hp.getStylesheetURLs();
      ctx.hasCSS = (data.urls.css.length > 0);
    }).catch(e => {
      throw new Error("HTML coudn't be loaded.");
    })
  }, {
    title: 'Load CSS files',
    enabled: ctx => ctx.hasCSS === true,
    task: () => {
      return new Observable(observer => {

        let promises = data.urls.css.map((u) => {
          return new Promise((resolve, reject) => {
            observer.next(u);
            prepare.loadContent(u).then(css => {
              resolve(css);
            }).catch(e => {
              reject(e);
            });
          });
        });

        var results = Promise.all(promises);

        results.then(res => {
          data.css = res;
          observer.complete();
        });

      });
    }
  }, {
    title: 'Check Fonts',
    enabled: ctx => ctx.hasCSS === true,
    task: () => {
      const cp = new CSSParser(data.css);
      cp.checkFonts();
    }
  }], {
    renderer: VerboseRenderer
  });

  tasks.run().catch(err => {
    console.error(err);
  });
}

module.exports = {
  run: run
};