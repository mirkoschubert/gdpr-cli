'use strict';

const sslCert = require('get-ssl-certificate');


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
  getSSLCertificate: getSSLCertificate
};