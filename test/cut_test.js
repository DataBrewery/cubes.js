var vows = require('vows'),
    assert = require('assert'),
    fs = require('fs');
var cubes = require('../cubes.js').cubes;

var suite = vows.describe('Cuts tests');

suite.addBatch({
  'cuts on loaded model': {
    topic: (new cubes.Model(JSON.parse(fs.readFileSync('test/model.json')))),
    'can cut by daily_date': function(model) { assert.strictEqual("daily_date:2013,5,1", new cubes.Cell(model.cubes[0]).slice(new cubes.PointCut('daily_date', null, [2013,5,1])).toString()); },
    'can cut with a null value': function(model) { assert.strictEqual("cohort_attr:pbr,__null__", new cubes.Cell(model.cubes[0]).slice(new cubes.PointCut('cohort_attr', null, ['pbr', null])).toString()); },
  }
});

suite.export(module);
