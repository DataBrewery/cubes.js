var minify = require("node-minify");

new minify.minify({
  'type': 'yui-js',
  'fileIn': 'cubes.js',
  'fileOut': 'cubes.min.js'
});

