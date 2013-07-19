var vows = require('vows'),
    assert = require('assert'),
    fs = require('fs');
var cubes = require('../cubes.js').cubes;

var suite = vows.describe('Cuts tests');

suite.addBatch({
  'cuts on loaded model': {
    topic: (new cubes.Model(JSON.parse(fs.readFileSync('test/model.json')))),
    'can cut by daily_date': function(model) { 
      assert.strictEqual("daily_date@ymd:2013,5,1", new cubes.Cell(model.cubes[0])
        .slice(new cubes.PointCut(model.dimension('daily_date'), null, [2013,5,1]))
        .toString()); 
    },
    'can cut by daily_date with set': function(model) { 
      assert.strictEqual("daily_date@ymd:2013,5,1;2013,6,1", new cubes.Cell(model.cubes[0])
        .slice(new cubes.SetCut(model.dimension('daily_date'), null, [[2013,5,1], [2013,6,1]]))
        .toString()); 
    },
    'can cut by daily_date with range': function(model) { 
      assert.strictEqual("daily_date@ymd:2013,5,1-2013,6,1", new cubes.Cell(model.cubes[0])
        .slice(new cubes.RangeCut(model.dimension('daily_date'), null, [2013,5,1], [2013,6,1]))
        .toString()); 
    },
    'can cut by daily_date with inverted range': function(model) { 
      assert.strictEqual("!daily_date@ymd:2013,5,1-2013,6,1", new cubes.Cell(model.cubes[0])
        .slice(new cubes.RangeCut(model.dimension('daily_date'), null, [2013,5,1], [2013,6,1], true))
        .toString()); 
    },
    'can cut on two dimensions daily_date with inverted range': function(model) { 
      assert.strictEqual("!daily_date@ymd:2013,5,1-2013,6,1|attr@default:foo", new cubes.Cell(model.cubes[1])
        .slice(new cubes.RangeCut(model.dimension('daily_date'), null, [2013,5,1], [2013,6,1], true))
        .slice(new cubes.PointCut(model.dimension("attr"), null, ["foo"]))
        .toString()); 
    },
    "re-slicing on a dimension preserves that dimension's place in the cut order": function(model) { 
      assert.strictEqual("daily_date@ymd:2013,7,1|attr@default:foo", new cubes.Cell(model.cubes[1])
        .slice(new cubes.RangeCut(model.dimension('daily_date'), null, [2013,5,1], [2013,6,1], true))
        .slice(new cubes.PointCut(model.dimension("attr"), null, ["foo"]))
        .slice(new cubes.PointCut(model.dimension("daily_date"), null, [2013,7,1]))
        .toString()); 
    },
    'can cut by attr with wacky characters': function(model) { 
      assert.strictEqual("!attr@default:Bicky\\-Boo\\|\\:Foo", new cubes.Cell(model.cubes[1])
          .slice(new cubes.PointCut(model.dimension('attr'), null, ["Bicky-Boo|:Foo"], true))
          .toString()); 
    },
    'point cut round trip': function(model) { 
      assert.strictEqual("!attr@default:unpaid,direct", cubes.cell_from_string(model.cubes[1], new cubes.Cell(model.cubes[1])
            .slice(new cubes.PointCut(model.dimension('attr'), null, ["unpaid", "direct"], true))
            .toString()).toString()); 
    },
    'set cut round trip': function(model) { 
      assert.strictEqual("!attr@default:unpaid,direct;paid,pnb", cubes.cell_from_string(model.cubes[1], new cubes.Cell(model.cubes[1])
            .slice(new cubes.SetCut(model.dimension('attr'), null, [["unpaid", "direct"], ["paid", "pnb"]], true))
            .toString()).toString()); 
    },
    'range cut round trip': function(model) { 
      assert.strictEqual("!attr@default:unpaid,direct-", cubes.cell_from_string(model.cubes[1], new cubes.Cell(model.cubes[1])
            .slice(new cubes.RangeCut(model.dimension('attr'), null, ["unpaid", "direct"], null, true))
            .toString()).toString()); 
    },
    'range cut round trip 2': function(model) { 
      assert.strictEqual("!attr@default:-unpaid,direct", cubes.cell_from_string(model.cubes[1], new cubes.Cell(model.cubes[1])
            .slice(new cubes.RangeCut(model.dimension('attr'), null, null, ["unpaid", "direct"], true)).toString()).toString()); 
    },
    'range cut round trip 3': function(model) { 
      assert.strictEqual("!attr@default:paid-unpaid,direct", cubes.cell_from_string(model.cubes[1], new cubes.Cell(model.cubes[1])
            .slice(new cubes.RangeCut(model.dimension('attr'), null, ["paid"], ["unpaid", "direct"], true)).toString()).toString()); 
    },
    'all wacky characters work round-trip in point cut': function(model) { 
      assert.strictEqual("!attr@default:Bicky\\-Boo\\|\\:Foo", cubes.cell_from_string(model.cubes[1], new cubes.Cell(model.cubes[1])
            .slice(new cubes.PointCut(model.dimension('attr'), null, ["Bicky-Boo|:Foo"], true)).toString()).toString()); 
    },
    'can cut with a null value': function(model) { 
      assert.strictEqual("cohort_attr@default:pbr,__null__", new cubes.Cell(model.cubes[0])
          .slice(new cubes.PointCut(model.dimension('cohort_attr'), null, ['pbr', null])).toString()); 
    },
  }
});

suite.export(module);
