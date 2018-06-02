'use strict';

const chalk = require('chalk');
const moment = require('moment');
const cui = require('cliui')();

class UI {

  constructor() {
    this.mode = 'normal';
    this.tableOptions = {};
  }

  /**
   * Sets the Mode (mute|normal|verbose)
   * @param {string} mode 
   */
  set(mode) {
    this.mode = (typeof mode !== undefined && ['mute', 'normal', 'verbose'].indexOf(mode) !== -1) ? mode : 'normal';
  }

  headline(str) {
    console.log('\n' + chalk.green(str.toUpperCase()) + '\n');
  }

  listitem(term, definition) {
    cui.div({
      text: chalk.yellow(term + ':'),
      width: 20,
      padding: [0, 2, 0, 0]
    }, {
      text: definition,
      padding: [0, 2, 0, 0]
    });
    console.log(cui.toString());
    cui.resetOutput()
  }

  settable(options) {
    const opt = {
      cells: options.cells || 0,
      widths: options.widths || [],
      padding: options.padding || [0, 2, 0, 0]
    }
    this.tableOptions = opt;
  }

  tableitem(row) {
    if (row.length !== this.tableOptions.cells) return;
    let data = [];
    row.forEach((entry, i) => {
      data.push({
        text: entry,
        width: this.tableOptions.widths[i],
        padding: this.tableOptions.padding
      });
    });
    //console.log(data);
    cui.div(...data);
    console.log(cui.toString());
    cui.resetOutput();
  }

  message(msg, state, showTime) {

    // Check if UI Mode exists and the message has the right format
    if (typeof msg !== 'string' && typeof msg !== 'object') return;
    if (typeof msg === 'object' && typeof msg[this.mode] === 'undefined') return;

    // Check if msg is a string and turn it into an object
    if (typeof msg === 'string') msg = {
      mute: msg,
      normal: msg,
      verbose: msg
    };
    // fill in the blanks
    ['mute', 'normal', 'verbose'].forEach(mode => {
      if (typeof msg[mode] === 'undefined') msg[mode] = '';
    });

    let _state = '';
    if (state && typeof state === 'object') {
      _state = (state.code === 200) ? chalk.green('[' + state.msg + ']') : chalk.red('[' + state.msg + ']');
    } else if (state && typeof state === 'string') {
      _state = (state !== '') ? chalk.dim('[' + state.toUpperCase() + ']') : '';
    }
    const _time = (typeof showTime !== 'undefined' && showTime === false) ? '          ' : chalk.dim('[' + moment().format('HH:mm:ss') + ']');
    const _message = msg[this.mode];

    console.log(_time + ' ' + _message + ' ' + _state);
  }

  info(msg) {
    console.log(msg);
  }

  error(msg, showTime) {

    const _message = chalk.red(msg);
    const _time = (typeof showTime !== 'undefined' && showTime === false) ? '' : chalk.dim('[' + moment().format('HH:mm:ss') + '] ');
    console.log(_time + _message);
  }
}

module.exports = UI;