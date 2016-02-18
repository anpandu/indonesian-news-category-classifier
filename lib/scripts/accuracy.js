
var jsonfile = require('jsonfile')
var Trainer = require('../modules/Trainer.js')
var Preprocess = require('../modules/Preprocess.js')
var Classifier = require('../modules/Classifier.js')

var datapath = process.argv[2]
var modelpath = process.argv[3]
var dataset = jsonfile.readFileSync(datapath)
var model = jsonfile.readFileSync(modelpath)

Preprocess.loadTfIdf(modelpath)
Classifier.loadModel(modelpath)

// dataset = dataset.slice(0,100)

var match = 0
dataset.forEach(function (ds, idx) {
	var score = Preprocess.process(ds.text).scores
  // var printscore = score
  //   .map(function (item) { return item[1].toFixed(5)})
  //   .reduce(function (a,b) { return a+'\t'+b})
  var prediction = Classifier.classify(score)
  var err = (ds.category==prediction) ? '-' : 'X'
  match += (ds.category==prediction) ? 1 : 0
  console.log('%d\t%s\t =>   %s\t%s\t%s',
    idx,
    err,
    ds.category.slice(0,7),
    prediction.slice(0,7),
    ds.url
  )
})
console.log(dataset.length, match, match/dataset.length)