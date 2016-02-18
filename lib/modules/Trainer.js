'use strict'

var _ = require('lodash')
var jsonfile = require('jsonfile')
var Tok = require('nalapa').tokenizer
var Word = require('nalapa').word
var Cleaner = require('nalapa').cleaner
var svm = require('node-svm')

var Trainer = function () {
  
}

Trainer.prototype.FREQ_THRESHOLD = 3

Trainer.prototype.BLACKLIST = ['kompas','detikhealth','detikoto','detiktravel','next','prev','wolipop','tempo','co','com','fds','rdn','lll','vit','rgr','ddn','arf','lth','odi','adr','eny','als','hst','aln','int','ami','nawangwulan','yon','dema','mechos','de','larocha','daily','mail']

Trainer.prototype.getCleanTokens = function(_tokens) {
  var tokens = _tokens
    .filter(function (token) { return (Cleaner.removeNonAlphaNumeric(token) !== '') })
    .filter(function (token) { return isNaN(token) })
    .map(function (token) { return token.toLowerCase() })
    .filter(function (token) { return Trainer.prototype.BLACKLIST.indexOf(token) === -1 })
    .filter(function (token) { return !Word.isStopword(token) })
  tokens = _.uniq(tokens)
  return tokens
}

Trainer.prototype.getCategoryList = function(data) {
  var categories = data
    .map(function (datum) { return datum.category })
  categories = _.uniq(categories)
  return categories
}

Trainer.prototype.appendCleanTokens = function(_data, _info) {
  var result = _data
    .map(function (d) { return { 'category': d.category, 'text': d.text, 'msg': d.title } })
    .map(function (d, idx) {
      if (_info)
        console.log(idx+'\t'+d.category.slice(0,7)+'\t\t'+d.msg)
      var tokens = Tok.tokenize(d.text)
      tokens = Trainer.prototype.getCleanTokens(tokens)
      d.tokens = tokens
      delete d.msg
      return d
    })
  return result
}

Trainer.prototype.getWordFreq = function(_data, _info) {
  var categories = Trainer.prototype.getCategoryList(_data)
  var result = categories
    .map(function (category) {
      if (_info)
        console.log(category)
      var tokens = _.chain(_data)
        .filter(function (d) { return d.category === category})
        .map(function (d) { return d.tokens })
        .flatten()
        .value()
      var freq = _.countBy(tokens, _.identity)
      var new_freq = {}
      for (var key in freq)
        if (freq[key] > Trainer.prototype.FREQ_THRESHOLD)
          new_freq[key] = freq[key]
      return { category: category, freq: new_freq }
    })
  return result
}

Trainer.prototype.getTFIDF = function(_freqs, _info) {
  var freqs_ori = _freqs.slice(0)
  // console.log(freqs_ori)
  var result = _freqs
    .map(function (datum) {
      var total = 0
      var tf = {}
      var idf = {}
      var tfidf = {}
      for (var key in datum.freq)
        total += datum.freq[key]
      for (var key in datum.freq) {
        tf[key] = datum.freq[key] / total
        var ncontaining = freqs_ori
          .map(function (_freq) { return (key in _freq.freq) ? 1 : 0 })
          .reduce(function (a, b) { return a + b })
        idf[key] = Math.log(freqs_ori.length / ncontaining)
        tfidf[key] = tf[key] * idf[key]
      }
      datum.tfidf = tfidf
      return datum
    })
  result = result.map(function (res) { return _.omit(res, ['freq'])}) 
  return result
}

var trainer = new Trainer ()
module.exports = trainer
