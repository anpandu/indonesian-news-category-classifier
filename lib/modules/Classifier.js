'use strict'

var _ = require('lodash')
var jsonfile = require('jsonfile')
var Tok = require('nalapa').tokenizer
var Word = require('nalapa').word
var Cleaner = require('nalapa').cleaner

var Classifier = function () {
  this.model = []
}

Classifier.prototype.loadModel = function(path) {
  this.model = jsonfile.readFileSync(path)
}

var classifier = new Classifier ()
classifier.loadModel('resources/15741.model.json')
module.exports = classifier
