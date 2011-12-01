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

Not yet implemented:

* cubes.Browser - aggregation browser
* cubes.Cell - browsing context (has multiple cuts)
* cubes.PointCut

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

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.




