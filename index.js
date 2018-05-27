#!/usr/bin/env node

'use strict'

const app = require('commander');
const Tasks = require('./lib/tasks');
const UI = require('./lib/ui');


const ui = new UI(); // initialize the UI

app
  .version(require('./package.json').version, '-V, --version')
  .option('-v, --verbose', 'shows you every single step')
  .option('-m, --mute', 'shows only the results of the analysis');

app
  .command('scan [url]')
  .alias('s')
  .description('Scans an url')
  .option('-f, --fonts', 'checks if any font is loading externally', true)
  .option('-s, --ssl', 'checks for SSL certificate', true)
  .option('-p, --prefetching', 'checks for DNS prefetching')
  .option('-a, --analytics', 'checks for Google Analytics & Piwik')
  .option('-r, --recursive', 'tries to follow links to check every internal site', false)
  .action((url, args) => {
    if (args.parent.verbose && args.parent.silent) {
      ui.error('\nYou have to choose between silent or verbose mode!\n');
      process.exit(0);
    }
    if (args.parent.verbose) ui.set('verbose');
    if (args.parent.mute) ui.set('silent');
    //console.log(args);
    const tasks = new Tasks(url, ui); // initialize the task runner

    if (args.ssl) tasks.new('ssl');
    if (args.fonts) tasks.new('fonts');
    if (args.prefetching) tasks.new('prefetching');
    if (args.analytics) tasks.new('analytics');

    tasks.run();
  });

app
  .command('help [command]')
  .description('shows the help for a specific command')
  .action(command => {
    if (!command) {
      app.help();
    } else {
      // specific help
      //app.help(command);
    }
  });

app.parse(process.argv);

//if (!app.args.length) app.help();