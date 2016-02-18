'use strict'

var _ = require('lodash')
var Promise = require('bluebird')
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

Trainer.prototype.getScore = function(_tokens, _tfidf) {
  var labels = _tfidf.map(function (dict) { return dict.category })
  var scores = _tfidf.map(function (dict) {
    if (_tokens.length == 0)
      return 0
    var score = _tokens
      .map(function (token) {
        var found = (token in dict.tfidf)
        var s = (!found) ? 0 : dict.tfidf[token]
        return s
      })
      .reduce(function (a,b) { return a+b })
    return score
  })
  var total = scores.reduce(function (a,b) { return a+b })
  scores = scores.map(function(score) { return score/((total==0) ? 1 : total) })
  var result = { labels: labels, scores: scores }
  return result
}

Trainer.prototype.appendCleanTokens = function(_data, _info) {
  var result = _data
    .map(function (d) { return { 'category': d.category, 'text': d.text, 'msg': d.title } })
    .map(function (d, idx) {
      if (_info)
        console.log(idx+' TOKEN\t'+d.category.slice(0,7)+'\t\t'+d.msg)
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
    .map(function (category, idx) {
      if (_info)
        console.log(idx+' FREQ\t'+category)
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
  var result = _freqs
    .map(function (datum, idx) {
      if (_info)
        console.log(idx+' TFIDF\t'+datum.category)
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

Trainer.prototype.appendScores = function(_data, _tfidf) {
  var result = _data
    .map(function (datum) {
      var tokens = Trainer.prototype.getCleanTokens(Tok.tokenize(datum.text))
      var scoreset = Trainer.prototype.getScore(tokens, _tfidf)
      datum.labels = scoreset.labels
      datum.scores = scoreset.scores
      return datum
    })
  return result
}

Trainer.prototype.train = function(_data, _info) {
  if (_info) console.log('\nPreprocessing text to token ...')
  var data2 = Trainer.prototype.appendCleanTokens(_data, _info)

  if (_info) console.log('\nComputing word frequency ...')
  var freqs = Trainer.prototype.getWordFreq(data2, _info)

  if (_info) console.log('\nComputing TFIDF ... ')
  var tfidf = Trainer.prototype.getTFIDF(freqs, _info)

  if (_info) console.log('\nComputing scores ...')
  var data3 = Trainer.prototype.appendScores(_data, tfidf)
  var dataset = data3.map(function (datum) { return [datum.scores, datum.labels.indexOf(datum.category)] })

  if (_info) console.log('\nTrain SVM model ...')
  var clf = new svm.CSVC()
  return new Promise (function (resolve, reject) {
      clf
        .train(dataset)
        .spread(function (model, report) {
          var result = {
            labels: data3[0].labels,
            svm: model
          }
          resolve(result)
        })
    })
}

var trainer = new Trainer ()
module.exports = trainer
