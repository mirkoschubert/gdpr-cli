#!/usr/bin/env node --harmony

'use strict'

require('rootpath')();

const app = require('commander');
const Parser = require('lib/parser');
const got = require('got');

app
  .version(require('package.json').version);

app
  .command('scan [url]')
  .description('Scans an url')
  .action(url => {
    console.log('Connecting to', url, '...');
    got(url, {}).then(res => {
      const p = new Parser(res.body);
      console.log(p.getMetaData());
    }).catch(e => {
      console.log(e.res.body);
    });
  });

app.parse(process.argv);
if (app.args.length === 0) app.help();