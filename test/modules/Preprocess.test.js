'use strict'

var _ = require('lodash')
var jsonfile = require('jsonfile')
var assert = require('assert')
var Preprocess = require('../../lib/modules/Preprocess.js')

describe('Preprocess', function () {

  it('loadTfIdf', function () {
	var answer = jsonfile.readFileSync('resources/tfidf-15741.json')
	assert(Preprocess.tfidf.length > 0, 'empty tfidf')
	Preprocess.tfidf.slice(0,5).forEach(function (tfidf, idx) {
    	assert(_.isEqual(tfidf, answer[idx]))
	})
  })

  it('getToken', function () {
  	var text = 'Kapal feri Sea Prince yang mengangkut sebanyak 100 orang dari Singapura menuju Indonesia tenggelam di Batam'
  	var answer = ['kapal','feri','sea','prince','mengangkut','orang','singapura','indonesia','tenggelam','batam']
  	var tokens = Preprocess.getToken(text)
    assert(_.isEqual(answer, tokens))
  })
})
