var vows = require('vows'),
    assert = require('assert'),
    fs = require('fs');
var cubes = require('../cubes.js').cubes;

var suite = vows.describe('Load Model from file');

suite.addBatch({
  'model loaded from file': {
    topic: (new cubes.Model(JSON.parse(fs.readFileSync('test/model.json')))),
    'is a model object': function(topic) { assert.instanceOf(topic, cubes.Model); }
  }
});

suite.export(module);
