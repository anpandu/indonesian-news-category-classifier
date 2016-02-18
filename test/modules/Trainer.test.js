'use strict'

var _ = require('lodash')
var jsonfile = require('jsonfile')
var assert = require('assert')
var Trainer = require('../../lib/modules/Trainer.js')

describe('Trainer', function () {

  it('appendCleanTokens', function () {
    var data = jsonfile.readFileSync('./test/fixtures/news10-category.json')
    data = Trainer.appendCleanTokens(data)
    assert(data.length === 10)
    data.forEach(function (datum) {
      assert('category' in datum)
      assert('text' in datum)
      assert('tokens' in datum)
    })
  })

})
