var vows = require('vows'),
    assert = require('assert'),
    fs = require('fs');
var cubes = require('../cubes.js').cubes;

var version_json = {
  version: "1.0alpha",
  api_version: "2",
  server_version: "1.0alpha"
};

var suite = vows.describe('Exercise Server');

function AjaxHandler(url, settings) {
  if ( typeof(url) == 'object' && settings === undefined ) {
    settings = url;
    url = settings.url;
  }
  var success = settings.success || function() {};
  var error = settings.error | function() { };
  url = url.replace('http://foo.com/cubes', '');

  if ( url.indexOf('/version') != -1 ) {
    return success(version_json, 'OK');
  }
  if ( url.indexOf('/aggregate') != -1 ) {
    return success({}, 'OK');
  }
  try {
    var filepath = "server_responses" + url + ".json";
    var resp_body = fs.readFileSync(filepath);
    return success(JSON.parse(resp_body), 'OK');
  } catch (e) {
    return error('Cannot provide server response for ' + url);
  }
}

suite.addBatch({
  'Server': {
    topic: function() { var s = new cubes.Server(AjaxHandler); s.connect("http://foo.com/cubes", this.callback); },
    'url is normalized': function(err, topic) { console.log(topic); assert.equal(topic.url, "http://foo.com/cubes/"); },
    'Browser': {
          topic: function(s) { return new cubes.Browser(s, s.get_cube(s._cube_list[0].name, this.callback)); },
          'has cube': function(topic) { assert.instanceOf(topic.cube, cubes.Cube); },
          'full cube': function(b) { assert.strictEqual(b.full_cube().cube, b.cube); assert.deepEqual(b.full_cube().cuts, []) },
          'can slice': function(b) { assert.instanceOf(b.full_cube().slice(new cubes.PointCut(b.cube.dimension('cohort_attr'), null, ['paid', 'direct'])).cuts[0], cubes.PointCut); },
          'can re-slice': function(b) { assert.strictEqual(b.full_cube().slice(new cubes.PointCut(b.cube.dimension('cohort_attr'), null, ['paid', 'direct'])).slice(new cubes.PointCut(b.cube.dimension('cohort_attr'), null, ['unpaid'])).cuts.length, 1); },
          'aggregate': function(b) { 
            var results = {};
            var handler = function(args) { results = { url: args.url, data: args.data }; };
            var s = new cubes.Server(handler); s.connect("http://foo.com/cubes"); 
            s.model = model_json;
            var browser = new cubes.Browser(s, new cubes.Cube(s.model.cubes[0]));
            browser.aggregate({cut: new cubes.PointCut(browser.cube.dimension('cohort_attr'), null, ['paid', 'direct'])});
            assert.deepEqual({url: "http://foo.com/cubes/cube/important_cube/aggregate", data: { cut: "cohort_attr@default:paid,direct" }}, results);
          }
    }
  }
});

suite.export(module);
