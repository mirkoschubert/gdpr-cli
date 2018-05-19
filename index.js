#!/usr/bin/env node --harmony

'use strict'

const app = require('commander');
const Tasks = require('./lib/tasks');
const UI = require('./lib/ui');


const ui = new UI(); // initialize the UI

app
  .version(require('./package.json').version, '-V, --version')
  .option('-v, --verbose', 'shows you every single step')
  .option('-s, --silent', 'shows only the results of the analysis');

app
  .command('scan [url]')
  .alias('s')
  .description('Scans an url')
  .option('-h, --html', 'reads only the HTML files', false)
  .option('-f, --fonts', 'checks if any font is loading externally', true)
  .option('-p, --prefetching', 'checks for DNS prefetching')
  .option('-r, --recursive', 'tries to follow links to check every internal site', false)
  .action((url, args) => {
    if (args.parent.verbose && args.parent.silent) {
      ui.error('\nYou have to choose between silent or verbose mode!\n');
    } else {
      if (args.parent.verbose) ui.set('verbose');
      if (args.parent.silent) ui.set('silent');
      //console.log(args);
      const tasks = new Tasks(url, ui); // initialize the task runner

      if (args.fonts) tasks.new('fonts');
      if (args.prefetching) tasks.new('prefetching');

      tasks.run();
    }
  });

app
  .command('help [command]')
  .description('shows the help for a specific command')
  .action(command => {
    if (!command) {
      app.help();
    } else {
      // specific help
    }
  });

app.parse(process.argv);

//if (!app.args.length) app.help();