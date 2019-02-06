#!/usr/bin/env node --harmony

'use strict'

const os = require('os');

console.error(os.type(), os.release(), os.arch());
