var vows = require('vows'),
    assert = require('assert'),
    fs = require('fs');
var cubes = require('../cubes.js').cubes;

var suite = vows.describe('Drilldown tests');

suite.addBatch({
  'cuts on loaded model': {
    topic: new cubes.Cube(JSON.parse(fs.readFileSync('test/server_responses/cube/important_cube_2/model.json'))),
    'basic toString round trip': function(model) { 
      var dd = new cubes.Drilldown(model.dimension('daily_date'), null, 'year');
      assert.strictEqual("daily_date@ymd:year", cubes.drilldown_from_string(model, dd.toString()).toString());
    },
    'basic toString round trip no hierarchy or level in initial string': function(model) { 
      var dd = cubes.drilldown_from_string(model, "daily_date");
      assert.strictEqual("daily_date@ymd:year", cubes.drilldown_from_string(model, dd.toString()).toString());
    },
    'basic toString round trip no level in initial string': function(model) { 
      var dd = cubes.drilldown_from_string(model, "daily_date@ymd");
      assert.strictEqual("daily_date@ymd:year", cubes.drilldown_from_string(model, dd.toString()).toString());
    },
    'keys in result cell': function(model) { 
      var dd = new cubes.Drilldown(model.dimension('daily_date'), null, 'year');
      assert.deepEqual(["daily_date.year"], dd.keysInResultCell());
    },
    'keys in result cell 2': function(model) { 
      var dd = new cubes.Drilldown(model.dimension('daily_date'), 'yqmd', 'month');
      assert.deepEqual(["daily_date.year", "daily_date.quarter", "daily_date.month"], dd.keysInResultCell());
    },
    'multiple drills': function(model) {
      var dds = cubes.drilldowns_from_string(model, "daily_date@ymd|attr:campaign");
      assert.deepEqual(dds, cubes.drilldowns_from_string(model, cubes.drilldowns_to_string(dds)));
    }
  }
});

suite.export(module);
