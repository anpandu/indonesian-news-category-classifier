'use strict'

var _ = require('lodash')
var jsonfile = require('jsonfile')
var Tok = require('nalapa').tokenizer
var Word = require('nalapa').word
var Cleaner = require('nalapa').cleaner

var Preprocess = function () {
  this.tfidf = []
}

Preprocess.prototype.loadTfIdf = function(path) {
  this.tfidf = jsonfile.readFileSync(path)
}

Preprocess.prototype.getToken = function(text) {
  var tokens = Tok.tokenize(text)
  tokens = tokens
    .filter(function (token) { return (Cleaner.removeNonAlphaNumeric(token) !== '') })
    .filter(function (token) { return isNaN(token) })
    .map(function (token) { return token.toLowerCase() })
    .filter(function (token) { return !Word.isStopword(token) })
  tokens = _.uniq(tokens)
  return tokens
}

var preprocess = new Preprocess ()
preprocess.loadTfIdf('resources/tfidf-15741.json')
module.exports = preprocess
