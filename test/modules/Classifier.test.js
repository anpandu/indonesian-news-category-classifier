'use strict'

var _ = require('lodash')
var jsonfile = require('jsonfile')
var assert = require('assert')
var Classifier = require('../../lib/modules/Classifier.js')

describe('Classifier', function () {

  it('loadModel', function () {
    var answer = jsonfile.readFileSync('resources/15741.model.json')
    assert(_.isObject(Classifier.model), 'empty model')
    assert(_.isEqual(Classifier.model, answer))
  })
})
