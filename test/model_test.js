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
    'first cube has measures': function(topic) { assert.strictEqual(topic.cubes[0].measures.length, 2); },
    'measure_info works': function(topic) { 
      var minfo = topic.cubes[0].measure_info();
      assert.strictEqual(minfo.length, 5);
      assert.strictEqual(minfo[0].ref, "record_count");
      assert.strictEqual(minfo[1].ref, "record_count_wma");
      assert.strictEqual(minfo[2].ref, "fooby_count");
      assert.strictEqual(minfo[3].ref, "fooby_sum");
      assert.strictEqual(minfo[4].ref, "fooby_count_sma");
      assert.strictEqual(minfo[4].label, "sma of count of fooby");
      assert.strictEqual(minfo[1].label, "wma of Acquisitions");
    },
    'many dimensions for first cube': function(topic) { assert.strictEqual(topic.cubes[0].dimensions.length, 2); },
    'first dimension is a dim object': function(topic) { assert.instanceOf(topic.cubes[0].dimensions[0], cubes.Dimension); },
    'dimension method return value matches dimensions array object': function(topic) { assert.strictEqual(topic.cubes[0].dimensions[0], topic.cubes[0].dimension(topic.cubes[0].dimensions[0].name)); },
    'dimension levels': function(topic) { assert.strictEqual(Object.keys(topic.cubes[0].dimensions[0].levels).length, 6); },
  }
});

suite.export(module);
