/*
 * recommendation-collection
 * Copyright(c) 2018 Baptiste LARVOL-SIMON, http://www.e-glop.net/
 * MIT Licensed
 */

'use strict'

function RecommendationCollection(){
}

RecommendationCollection.prototype.collection = {};

/**
 * @return void
 **/
RecommendationCollection.prototype.add = function(key, value) {
  if ( !Array.isArray(this.collection[key]) ) {
    this.collection[key] = []
  }

  this.collection[key].push(value);
}

/**
 * @return Array
 **/
RecommendationCollection.prototype.getTopics = function() {
  return Object.keys(this.collection);
}

/**
 * @return Array
 **/
RecommendationCollection.prototype.getWarningsFor = function(key) {
  return this.collection[key];
}

module.exports = RecommendationCollection;
