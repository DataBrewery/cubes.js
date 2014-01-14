var vows = require('vows'),
    assert = require('assert'),
    fs = require('fs');
var cubes = require('../cubes.js').cubes;

var suite = vows.describe('Cuts tests');

suite.addBatch({
  'cuts on loaded cube': {
    topic: (new cubes.Cube(JSON.parse(fs.readFileSync('test/server_responses/cube/important_cube_2/model.json')))),
    'can cut by daily_date': function(cube) { 
      assert.strictEqual("daily_date@ymd:2013,5,1", new cubes.Cell(cube)
        .slice(new cubes.PointCut(cube.dimension('daily_date'), null, [2013,5,1]))
        .toString()); 
    },
    'can cut by daily_date with set': function(cube) { 
      assert.strictEqual("daily_date@ymd:2013,5,1;2013,6,1", new cubes.Cell(cube)
        .slice(new cubes.SetCut(cube.dimension('daily_date'), null, [[2013,5,1], [2013,6,1]]))
        .toString()); 
    },
    'can cut by daily_date with range': function(cube) { 
      assert.strictEqual("daily_date@ymd:2013,5,1-2013,6,1", new cubes.Cell(cube)
        .slice(new cubes.RangeCut(cube.dimension('daily_date'), null, [2013,5,1], [2013,6,1]))
        .toString()); 
    },
    'can cut by daily_date with inverted range': function(cube) { 
      assert.strictEqual("!daily_date@ymd:2013,5,1-2013,6,1", new cubes.Cell(cube)
        .slice(new cubes.RangeCut(cube.dimension('daily_date'), null, [2013,5,1], [2013,6,1], true))
        .toString()); 
    },
    'can cut on two dimensions daily_date with inverted range': function(cube) { 
      assert.strictEqual("!daily_date@ymd:2013,5,1-2013,6,1|attr@default:foo", new cubes.Cell(cube)
        .slice(new cubes.RangeCut(cube.dimension('daily_date'), null, [2013,5,1], [2013,6,1], true))
        .slice(new cubes.PointCut(cube.dimension("attr"), null, ["foo"]))
        .toString()); 
    },
    "re-slicing on a dimension preserves that dimension's place in the cut order": function(cube) { 
      assert.strictEqual("daily_date@ymd:2013,7,1|attr@default:foo", new cubes.Cell(cube)
        .slice(new cubes.RangeCut(cube.dimension('daily_date'), null, [2013,5,1], [2013,6,1], true))
        .slice(new cubes.PointCut(cube.dimension("attr"), null, ["foo"]))
        .slice(new cubes.PointCut(cube.dimension("daily_date"), null, [2013,7,1]))
        .toString()); 
    },
    'can cut by attr with wacky characters': function(cube) { 
      assert.strictEqual("!attr@default:Bicky\\-Boo\\|\\:Foo", new cubes.Cell(cube)
          .slice(new cubes.PointCut(cube.dimension('attr'), null, ["Bicky-Boo|:Foo"], true))
          .toString()); 
    },
    'point cut round trip': function(cube) { 
      assert.strictEqual("!attr@default:unpaid,direct", cubes.cell_from_string(cube, new cubes.Cell(cube)
            .slice(new cubes.PointCut(cube.dimension('attr'), null, ["unpaid", "direct"], true))
            .toString()).toString()); 
    },
    'set cut round trip': function(cube) { 
      assert.strictEqual("!attr@default:unpaid,direct;paid,pnb", cubes.cell_from_string(cube, new cubes.Cell(cube)
            .slice(new cubes.SetCut(cube.dimension('attr'), null, [["unpaid", "direct"], ["paid", "pnb"]], true))
            .toString()).toString()); 
    },
    'range cut round trip': function(cube) { 
      assert.strictEqual("!attr@default:unpaid,direct-", cubes.cell_from_string(cube, new cubes.Cell(cube)
            .slice(new cubes.RangeCut(cube.dimension('attr'), null, ["unpaid", "direct"], null, true))
            .toString()).toString()); 
    },
    'range cut round trip 2': function(cube) { 
      assert.strictEqual("!attr@default:-unpaid,direct", cubes.cell_from_string(cube, new cubes.Cell(cube)
            .slice(new cubes.RangeCut(cube.dimension('attr'), null, null, ["unpaid", "direct"], true)).toString()).toString()); 
    },
    'range cut round trip 3': function(cube) { 
      assert.strictEqual("!attr@default:paid-unpaid,direct", cubes.cell_from_string(cube, new cubes.Cell(cube)
            .slice(new cubes.RangeCut(cube.dimension('attr'), null, ["paid"], ["unpaid", "direct"], true)).toString()).toString()); 
    },
    'all wacky characters work round-trip in point cut': function(cube) { 
      assert.strictEqual("!attr@default:Bicky\\-Boo\\|\\:Foo", cubes.cell_from_string(cube, new cubes.Cell(cube)
            .slice(new cubes.PointCut(cube.dimension('attr'), null, ["Bicky-Boo|:Foo"], true)).toString()).toString()); 
    },
    'can cut with a null value': function(cube) { 
      assert.strictEqual("attr@default:pbr,__null__", new cubes.Cell(cube)
          .slice(new cubes.PointCut(cube.dimension('attr'), null, ['pbr', null])).toString()); 
    },
  }
});

suite.export(module);
