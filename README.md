About
=====

Cubes.js is a JavaScript framework for online analytical processing (OLAP) server Cubes - Slicer.

Cubes: http://databrewery.org/cubes.html
Server documentation: http://packages.python.org/cubes/server.html

Namespaces and object prototypes:

* cubes - top level namespace
* cubes.Server - Slicer server connection (based on root URL)
* cubes.Model - logical model
* cubes.Dimension
* cubes.Hierarchy
* cubes.Level
* cubes.Attribute

Not yet fully implemented:

* cubes.Browser - aggregation browser
* cubes.Cell - browsing context (has multiple cuts)
* cubes.PointCut

Not yet implemented:

* cubes.SetCut
* cubes.RangeCut

Note: This is my very first JavaScript code and I am learning the language while writing the framework. I
am accepting any constructive criticism how to make the code better.

Requirements
============

cubes.js requires following JavaScript frameworks:

* underscore.js
* jQuery

Author
======

Stefan Urbanek, December 2011

License
=======

Licensed under LGPL.
