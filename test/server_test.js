var vows = require('vows'),
    assert = require('assert'),
    fs = require('fs');
var cubes = require('../cubes.js').cubes;

var version_json = {
  version: "0.10.2",
  api_version: "1",
  server_version: "0.10.2"
};

var model_json = JSON.parse(fs.readFileSync('test/model.json'));
var aggregate_json = { };

var suite = vows.describe('Exercise Server');

function AjaxHandler(url, settings) {
  if ( typeof(url) == 'object' && settings === undefined ) {
    settings = url;
    url = settings.url;
  }
  var success = settings.success || function() {};
  if ( url.indexOf('/version') != -1 ) {
    return success(version_json, 'OK');
  }
  if ( url.indexOf('/model') != -1 ) {
    return success(model_json, 'OK');
  }
  return success(aggregate_json, 'OK');
}

suite.addBatch({
  'Server': {
    topic: function() { var s = new cubes.Server(AjaxHandler); s.connect("http://foo.com/cubes"); return s; },
    'has model': function(topic) { assert.instanceOf(topic.model, cubes.Model); },
    'url is normalized': function(topic) { assert.equal(topic.url, "http://foo.com/cubes/"); },
    'Browser': {
          topic: function() { var s = new cubes.Server(AjaxHandler); s.connect("http://foo.com/cubes"); return new cubes.Browser(s, s.model.cubes[0]); },
          'full cube': function(b) { assert.strictEqual(b.full_cube().cube, b.cube); assert.deepEqual(b.full_cube().cuts, []) },
          'can slice': function(b) { assert.instanceOf(b.full_cube().slice(new cubes.PointCut(b.cube.dimension('cohort_attr'), null, ['paid', 'direct'])).cuts[0], cubes.PointCut); },
          'can re-slice': function(b) { assert.strictEqual(b.full_cube().slice(new cubes.PointCut(b.cube.dimension('cohort_attr'), null, ['paid', 'direct'])).slice(new cubes.PointCut(b.cube.dimension('cohort_attr'), null, ['unpaid'])).cuts.length, 1); },
          'aggregate': function(b) { 
            var results = {};
            var handler = function(args) { results = { url: args.url, data: args.data }; };
            var s = new cubes.Server(handler); s.connect("http://foo.com/cubes"); 
            s.model = new cubes.Model(model_json);
            var browser = new cubes.Browser(s, s.model.cubes[0]);
            browser.aggregate({cut: new cubes.PointCut(browser.cube.dimension('cohort_attr'), null, ['paid', 'direct'])});
            assert.deepEqual({url: "http://foo.com/cubes/cube/important_cube/aggregate", data: { cut: "cohort_attr@default:paid,direct" }}, results);
          }
    }
  }
});

suite.export(module);
