#!/usr/bin/env node --harmony

'use strict'

const arr = [];
console.log(typeof arr);

/*
const os = require('os');
const pkg = require('./package.json');

console.error(os.type(), os.release(), os.arch());
console.error(pkg.name, pkg.version, pkg.description);
console.error(new Date().toLocaleString());

const dns = require('dns');
const url = 'http://myurl.tld/glop';
console.error(url.replace(/^https{0,1}:\/\/([^\/]+)\/.*$/, '$1'));
//dns.resolve('resolver1.opendns.com', 'A', function(err, addresses){

/*
dns.resolve('resolver1.opendns.com', 'A', function(err, addresses){
    console.error(err, addresses);
    dns.setServers(addresses);
    dns.resolve('myip.opendns.com', 'A', function(err, addresses){
        console.error(err, addresses);
    });
})
*/
