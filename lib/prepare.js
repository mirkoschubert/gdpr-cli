'use strict';

const got = require('got');

function loadContent(url) {

  return new Promise((resolve, reject) => {
    got(url).then(res => {
      resolve(res.body);
    }).catch(err => {
      reject(err);
    });
  });
}


module.exports = {
  loadContent: loadContent
};