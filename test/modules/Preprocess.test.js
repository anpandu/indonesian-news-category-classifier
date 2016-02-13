'use strict'

var _ = require('lodash')
var assert = require('assert')
var Preprocess = require('../../lib/modules/Preprocess.js')

describe('Preprocess', function () {

  it('getToken', function () {

  	var text = 'Kapal feri Sea Prince yang mengangkut sebanyak 100 orang dari Singapura menuju Indonesia tenggelam di Batam'
  	var answer = ['kapal','feri','sea','prince','mengangkut','orang','singapura','indonesia','tenggelam','batam']
  	var tokens = Preprocess.getToken(text)
    assert(_.isEqual(answer, tokens))
  })
})
