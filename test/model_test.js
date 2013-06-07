var vows = require('vows'),
    assert = require('assert'),
    fs = require('fs');
var cubes = require('../cubes.js').cubes;

var suite = vows.describe('Load Model from file');

suite.addBatch({
  'model loaded from file': {
    topic: (new cubes.Model(JSON.parse(fs.readFileSync('test/model.json')))),
    'is a model object': function(topic) { assert.instanceOf(topic, cubes.Model); },
    'has two cubes': function(topic) { assert.strictEqual(topic.cubes.length, 2); },
    'first cube has measures': function(topic) { assert.strictEqual(topic.cubes[0].measures.length, 1); },
    'many dimensions for first cube': function(topic) { assert.strictEqual(topic.cubes[0].dimensions.length, 2); },
    'first dimension is a dim object': function(topic) { assert.instanceOf(topic.cubes[0].dimensions[0], cubes.Dimension); },
    'dimension method return value matches dimensions array object': function(topic) { assert.strictEqual(topic.cubes[0].dimensions[0], topic.cubes[0].dimension(topic.cubes[0].dimensions[0].name)); },
    'dimension levels': function(topic) { assert.strictEqual(Object.keys(topic.cubes[0].dimensions[0].levels).length, 6); },
  }
});

suite.export(module);
