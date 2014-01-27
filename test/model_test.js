var vows = require('vows'),
    assert = require('assert'),
    fs = require('fs');
var cubes = require('../cubes.js').cubes;

var suite = vows.describe('Load Model from file');

suite.addBatch({
  'model loaded from file': {
    topic: new cubes.Cube(JSON.parse(fs.readFileSync('test/server_responses/cube/important_cube/model.json'))),
    'cube is a Cube object': function(topic) { assert.instanceOf(topic, cubes.Cube); },
    'cube has aggregates': function(topic) { assert.strictEqual(topic.aggregates.length, 2); },
    'many dimensions for first cube, including split': function(topic) { assert.strictEqual(topic.dimensions.length, 2); },
    'first dimension is a dim object': function(topic) { assert.instanceOf(topic.dimensions[0], cubes.Dimension); },
    'dimension method return value matches dimensions array object': function(topic) { assert.strictEqual(topic.dimensions[0], topic.dimension(topic.dimensions[0].name)); },
    'dimension levels': function(topic) { assert.strictEqual(Object.keys(topic.dimensions[0].levels).length, 6); },
  }
});

suite.export(module);
