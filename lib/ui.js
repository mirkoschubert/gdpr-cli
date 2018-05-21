'use strict';

const chalk = require('chalk');
const moment = require('moment');
const cui = require('cliui')();

class UI {

  constructor() {
    this.mode = 'normal';
  }

  /**
   * Sets the Mode (silent|normal|verbose)
   * @param {string} mode 
   */
  set(mode) {
    this.mode = mode || 'normal';
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

  message(msg, state, showTime) {

    // Check if UI Mode exists und the message has the right format
    if (typeof msg !== 'string' && typeof msg !== 'object') return;
    if (typeof msg === 'object' && typeof msg[this.mode] === 'undefined') return;

    // Check if msg is a string and turn it into an object
    if (typeof msg === 'string') msg = {
      silent: msg,
      normal: msg,
      verbose: msg
    };
    // fill in the blanks
    ['silent', 'normal', 'verbose'].forEach(mode => {
      if (typeof msg[mode] === 'undefined') msg[mode] = '';
    });

    const _message = msg[this.mode];
    const _state = (state && state !== '') ? chalk.dim('[' + state.toUpperCase() + ']') : '';
    const _time = (typeof showTime !== 'undefined' && showTime === false) ? '          ' : chalk.dim('[' + moment().format('HH:mm:ss') + ']');

    console.log(_time + ' ' + _message + ' ' + _state);
  }

  error(msg) {

    const _message = chalk.red(msg);
    const _time = chalk.dim('[' + moment().format('HH:mm:ss') + ']');
    console.log(_time + ' ' + _message);
  }
}

module.exports = UI;