'use strict';

const URL = require('url').URL;
const sslCert = require('get-ssl-certificate');


function normalizeURL(Url) {

  if (Url.href.protocol !== '') {

  } else {

  }

}


function getSSLCertificate(url) {
  return new Promise((resolve, reject) => {
    sslCert.get(url).then(cert => {
      resolve(cert);
    }).catch(e => {
      reject(e);
    });
  });
}

module.exports = {
  getSSLCertificate,
  normalizeURL
};