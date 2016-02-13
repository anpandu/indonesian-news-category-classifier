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

  it('getScores', function () {
  	var text = 'Southampton - Liverpool menang besar kala bertandang ke Southampton di babak kelima Piala Liga Inggris. Tertinggal lebih dahulu, Liverpool bikin 6 gol balasan di mana Divock Origi mencetak hat-trick dan Daniel Sturridge dua gol.'
  	var tokens = Preprocess.getToken(text)
  	var scores = Preprocess.getScores(tokens)
  	var answer = [['edukasi',0],['health',0.013179993339527183],['otomotif',0.006944538961005934],['travel',0.00468372455468156],['lifestyle',0.006553536617307781],['techno',0.0059976401687693226],['internasional',0.013970809906758731],['entertainment',0.026342190273355503],['ibukota',0.00823981083667967],['bisnis',0.011703977125550982],['sport',0.8923837793151527],['nasional',0.009999998901210611]]
    assert(_.isEqual(answer, scores))
  })
})
