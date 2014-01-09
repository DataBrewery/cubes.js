About
=====

Cubes.js is a JavaScript framework for online analytical processing (OLAP)
server Cubes - Slicer.

Cubes: http://cubes.databrewery.org
Server documentation: http://packages.python.org/cubes/server.html

Namespaces and object prototypes:

* `cubes` - top level namespace
* `cubes.Server` - Slicer server connection (based on root URL)
* `cubes.Cube`
* `cubes.Dimension`
* `cubes.Hierarchy`
* `cubes.Level`
* `cubes.Attribute`

* `cubes.Browser`
* `cubes.Cell` - browsing context (has multiple cuts)
* `cubes.PointCut`
* `cubes.SetCut`
* `cubes.RangeCut`

This library supports the extended features of cuts -- inversion, full
escaping of sensitive characters -- as implemented in the Squarespace fork of
Cubes at https://github.com/Squarespace/cubes.

Requirements
============

Squarespace's version of cubes.js does not require any external library,
neither underscore.js nor jQuery.  However, to use the query() function or to
fetch the model JSON, you must provide a jQuery-compatible ajax function to
the cubes.Server constructor.

Tests
=====

Tests are provided in the test/ folder. Use node and the vows node module to
run them:

    $ npm install
    $ vows

The vows tool will run all the .js test files it finds in the test/ folder.

Authors
=======

Stefan Urbanek <stefan.urbanek@gmail.com>
Robin Thomas

See AUTHORS file for more information.

License
=======

Cubes.js is licensed under MIT license.  For full license see the LICENSE
file.
