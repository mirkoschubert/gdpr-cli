'use strict';

// connext.facebook.net
function hasFacebookConnect(js) {
  let fc = false;
  js.inline.forEach(js => {
    if (js.indexOf('connect.facebook.net') !== -1) fc = true;
  });
  return fc;
}

// graph.facebook.com
function hasFacebookSocialGraph(js) {
  let sg = false;
  js.forEach(el => {
    if (el.url.host === 'graph.facebook.com') sg = true;
    if (el.content.indexOf('graph.facebook.com') !== -1) sg = true;
  });
  return sg;
}

// api.pinterest.com
function hasPinterest(js) {
  let pi = false;
  js.forEach(el => {
    if (el.url.host === 'api.pinterest.com') pi = true;
    if (el.content.indexOf('api.pinterest.com') !== -1) pi = true;
  });
  return pi;
}

module.exports = {
  hasFacebookConnect,
  hasFacebookSocialGraph,
  hasPinterest
};