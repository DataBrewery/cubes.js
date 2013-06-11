(function(){

    // underscore simulation.

    var _ = {};

    _.map = function(ary, f) {
      var ret = [];
      for (var i = 0; i < ary.length; i++) {
        ret.push(f(ary[i]));
      }
      return ret;
    };

    _.filter = function(ary, f) {
      var ret = [];
      for (var i = 0; i < ary.length; i++) {
        if ( f(ary[i]) ) ret.push(ary[i]);
      }
      return ret;
    };

    _.find = function(ary, f) {
      for (var i = 0; i < ary.length; i++) {
        if ( f(ary[i]) ) return ary[i];
      }
      return null;
    };

    // Variables and functions go here.
    var root = this;
    var cubes = { };

    cubes.Server = function(ajaxHandler){
        // Represents Cubes Slicer Server connection.
        //
        // Attributes:
        //
        // * `ajaxHandler`: a function accepting jquery-style settings object as in $.ajax(settings)
        //

        this.ajaxRequest = ajaxHandler;
    };

    cubes.Server.prototype.ajaxRequest = function(settings) {
        throw "Must implement ajaxRequest for server to process jquery-style $.ajax settings object";
    };

    cubes.Server.prototype.query = function(query, cube, args, callback) {
        var params = {dataType : 'json', type : "GET"};

        if(cube.hasOwnProperty("name"))
            cube_name = cube.name;
        else
            cube_name = cube;

        params.url = this.url + "cube/" + cube_name + "/" + query;
        params.data = args;

        if(args && args.cut)
            params.data.cut = params.data.cut.toString();

        params.success = function(obj) {
            callback(obj);
        };
        params.error = function(obj) {
            // FIXME: Some error handler here
        };

        return this.ajaxRequest(params);
    };

    cubes.Server.prototype.connect = function(url, callback) {
        var self = this;

        self.url = self._normalize_url(url);

        var options = {dataType : 'json', type : "GET", error: self._onError};

        options.url = self.url + 'version';

        options.success = function(resp, status, xhr) {
            self.server_version = resp.server_version;
            self.api_version = resp.api_version;
            self.load_model(callback);
        };

        this.ajaxRequest(options);
    };

    cubes.Server.prototype._normalize_url = function(url) {
        if(url[url.length-1] != '/')
            return url + '/';
        return url;
    };

    cubes.Server.prototype.load_model = function(callback) {
        var self = this;

        var options = {dataType : 'json', type : "GET", error: self._onError};

        options.url = self.url + 'model';

        options.success = function(resp, status, xhr) {
            self.model = new cubes.Model(resp);

            // FIXME: handle model parse failure

            if (callback)
                callback(self.model);
        };

        return this.ajaxRequest(options);
    };

    cubes.Model = function(obj){
        // obj - model description
        this.parse(obj);
    };

    cubes.Model.prototype.parse = function(desc) {
        var model = this;
        var i;

        !desc.name        || (model.name = desc.name);
        !desc.label       || (model.label = desc.label);
        !desc.description || (model.description = desc.description);
        !desc.locale      || (model.locale = desc.locale);
        !desc.info || (model.info = desc.info);
        model.locales = desc.locales;

        model.dimensions = [];

        if(desc.dimensions) {
            for(i in desc.dimensions) {
                var dim = new cubes.Dimension(desc.dimensions[i]);
                model.dimensions.push(dim);
            }
        }

        model.cubes = [];

        if(desc.cubes) {
            for(i in desc.cubes) {
                var cube = new cubes.Cube(desc.cubes[i], this);
                model.cubes.push(cube);
            }
        }

    };

    cubes.Model.prototype.dimension = function(name) {
        // Return a dimension with given name
        return _.find(this.dimensions, function(dim){return dim.name == name;});
    };

    cubes.Model.prototype.cube = function(name) {
        // Return a dimension with given name
        return _.find(this.cubes, function(obj){return obj.name == name;});
    };

    cubes.Cube = function(obj, model) {
        this.url = null;
        this.parse(obj, model);
    };

    cubes.Cube.prototype.parse = function(desc, model) {
        var i, obj;

        this.name = desc.name;
        !desc.label || (this.label = desc.label);
        !desc.description || (this.description = desc.description);
        !desc.key || (this.key = desc.key);
        !desc.info || (this.info = desc.info);

        this.measures = [];

        for(i in desc.measures) {
            obj = new cubes.Attribute(desc.measures[i]);
            this.measures.push(obj);
        }

        this.details = [];

        for(i in desc.details) {
            obj = new cubes.Attribute(desc.details[i]);
            this.details.push(obj);
        }

        this.dimensions = _.map(desc.dimensions, function(name) {return model.dimension(name);} );
    };

    cubes.Cube.prototype.dimension = function(name) {
        // Return a dimension with given name
        return _.find(this.dimensions, function(obj){return obj.name == obj;});
    };

    cubes.Dimension = function(obj){
        this.parse(obj);
    };

    cubes.Dimension.prototype.parse = function(desc) {
        var dim = this;
        var i;

        dim.name = desc.name;
        !desc.label || (dim.label = desc.label);
        !desc.description || (dim.description = desc.description);
        !desc.default_hierarchy_name || (dim.default_hierarchy_name = desc.default_hierarchy_name);
        !desc.info || (dim.info = desc.info);

        dim.levels = {};

        if(desc.levels) {
            for(i in desc.levels) {
                var level = new cubes.Level(dim.name, desc.levels[i]);
                dim.levels[level.name] = level;
            }
        }

        this.hierarchies = {};

        if(desc.hierarchies) {
            for(i in desc.hierarchies) {
                var hier = new cubes.Hierarchy(desc.hierarchies[i], this);
                dim.hierarchies[hier.name] = hier;
            }
        }
    };

    cubes.Dimension.prototype.level = function(name) {
        // Return a level with given name
        return _.find(this.levels, function(obj){return obj.name == obj;});
    };

    cubes.Dimension.prototype.toString = function(desc) {
        return this.name;
    };

    cubes.Dimension.prototype.display_label = function() {
        return this.label || this.name;
    };

    cubes.Dimension.prototype.hierarchy = function(name) {
        if(name)
            return this.hierarchies[name];
        else
            return this.hierarchies[default_hierarchy_name];
    };

    cubes.Hierarchy = function(obj, dim){
        this.parse(obj, dim);
    };

    cubes.Hierarchy.prototype.parse = function(desc, dim) {
        var hier = this;
        var i;

        hier.name = desc.name;
        !desc.label || (hier.label = desc.label)
        !desc.description || (hier.description = desc.description)
        !desc.info || (hier.info = desc.info);

        hier._level_names = [];

        for(i in desc.levels) {
            hier._level_names.push(desc.levels[i]);
        }

        hier.levels = _.map(hier._level_names, function(name) {return dim.level(name);} );
    };

    cubes.Hierarchy.prototype.toString = function(desc) {
        return cubes.HIERARCHY_PREFIX_CHAR + this.name;
    };

    cubes.Hierarchy.prototype.display_label = function() {
        return this.label || this.name;
    };

    cubes.Level = function(dimension_name, obj){
        this.parse(dimension_name, obj);
    };

    cubes.Level.prototype.parse = function(dimension_name, desc) {
        var level = this;
        var i;

        level.dimension_name = dimension_name;
        level.name = desc.name;
        !desc.label || (level.label = desc.label);
        !desc.description || (level.description = desc.description);
        !desc.info || (level.info = desc.info);
        level._key = desc.key;
        level._label_attribute = desc.label_attribute;

        level.attributes = [];

        if(desc.attributes) {
            for(i in desc.attributes) {
                var attr = new cubes.Attribute(desc.attributes[i]);
                level.attributes.push(attr);
            }
        }
    };

    cubes.Level.prototype.key = function(desc) {
        // Key attribute is either explicitly specified or it is first attribute in the list
        return level._key || level.attributes[0];
    };

    cubes.Level.prototype.label_attribute = function(desc) {
        // Label attribute is either explicitly specified or it is second attribute if there are more
        // than one, otherwise it is first
        return level._label_attribute || level.attributes[1] || level.attributes[0];
    };

    cubes.Level.prototype.toString = function(desc) {
        return this.name;
    };

    cubes.Level.prototype.display_name = function() {
      return this.label || this.name;
    };

    cubes.Level.prototype.full_name = function() {
        return this.dimension_name + cubes.ATTRIBUTE_STRING_SEPARATOR_CHAR + this.name;
    };

    cubes.Level.prototype.full_name_for_drilldown = function() {
        return this.dimension_name + cubes.DIMENSION_STRING_SEPARATOR_CHAR + this.name;
    };


    cubes.Attribute = function(obj){
        this.name = obj.name;
        this.label = obj.label;
        this.order = obj.order;
        this.locales = obj.locales;
    };

    cubes.Browser = function(server, cube){
        this.cube = cube;
        this.server = server;
    };

    cubes.Browser.prototype.full_cube = function(dimension) {
        return new cubes.Cell(this.cube);
    };

    cubes.Browser.prototype.aggregate = function(cell, drilldown, callback) {
        var args = {};

        if (cell) args.cut = cell;
        if (drilldown) args.drilldown = drilldown;

        this.server.query("aggregate", this.cube, args, callback);
    };

    cubes.Cell = function(cube){
        this.cube = cube;
        this.cuts = [];
    };

    cubes.Cell.prototype.slice = function(new_cut) {
        var cuts = [];
        var new_cut_pushed = false;
        for (var i = 0; i < this.cuts.length; i++) {
          var c = this.cuts[i];
          if ( c.dimension == new_cut.dimension ){
            cuts.push(new_cut);
            new_cut_pushed = true;
          }
          else {
            cuts.push(c);
          }
        }
        if ( ! new_cut_pushed ) {
          cuts.push(new_cut);
        }
        var cell = new cubes.Cell(this.cube);
        cell.cuts = cuts;
        return cell;
    };

    cubes.Cell.prototype.toString = function() {
        return _.map(this.cuts || [], function(cut) { return cut.toString(); }).join(cubes.CUT_STRING_SEPARATOR_CHAR);
    };

    cubes.Cell.prototype.cut_for_dimension = function(name) {
        return _.find(this.cuts, function(cut) {
            return cut.dimension.name == name;
        });
    };

    cubes.PointCut = function(dimension, hierarchy, path, invert) {
        this.type = 'point';
        this.dimension = dimension;
        this.hierarchy = hierarchy;
        this.path = path;
        this.invert = !!invert;
    };

    cubes.PointCut.prototype.toString = function() {
        var path_str = cubes.string_from_path(this.path);
        return (this.invert ? cubes.CUT_INVERSION_CHAR : "") +
            this.dimension +
            ( this.hierarchy ? ( cubes.HIERARCHY_PREFIX_CHAR + this.hierarchy ) : '' ) +
            cubes.DIMENSION_STRING_SEPARATOR_CHAR +
            path_str;
    };

    cubes.SetCut = function(dimension, hierarchy, paths, invert) {
        this.type = 'set';
        this.dimension = dimension;
        this.hierarchy = hierarchy;
        this.paths = paths;
        this.invert = !!invert;
    };

    cubes.SetCut.prototype.toString = function() {
        var path_str = _.map(this.paths, cubes.string_from_path).join(cubes.SET_CUT_SEPARATOR_CHAR);
        return (this.invert ? cubes.CUT_INVERSION_CHAR : "") +
            this.dimension +
            ( this.hierarchy ? ( cubes.HIERARCHY_PREFIX_CHAR + this.hierarchy ) : '' ) +
            cubes.DIMENSION_STRING_SEPARATOR_CHAR +
            path_str;
    };

    cubes.RangeCut = function(dimension, hierarchy, from_path, to_path, invert){
        this.type = 'range';
        this.dimension = dimension;
        this.hierarchy = hierarchy;
        if ( from_path === null && to_path === null ) {
            throw "Either from_path or to_path must be defined for RangeCut";
        }
        this.from_path = from_path;
        this.to_path = to_path;
        this.invert = !!invert;
    };

    cubes.RangeCut.prototype.toString = function() {
        var path_str = cubes.string_from_path(this.from_path) + cubes.RANGE_CUT_SEPARATOR_CHAR + cubes.string_from_path(this.to_path);
        return (this.invert ? cubes.CUT_INVERSION_CHAR : "") +
            this.dimension +
            ( this.hierarchy ? ( cubes.HIERARCHY_PREFIX_CHAR + this.hierarchy ) : '' ) +
            cubes.DIMENSION_STRING_SEPARATOR_CHAR +
            path_str;
    };

    cubes.CUT_INVERSION_CHAR = "!";
    cubes.CUT_STRING_SEPARATOR_CHAR = "|";
    cubes.DIMENSION_STRING_SEPARATOR_CHAR = ":";
    cubes.ATTRIBUTE_STRING_SEPARATOR_CHAR = ".";
    cubes.HIERARCHY_PREFIX_CHAR = "@";
    cubes.PATH_STRING_SEPARATOR_CHAR = ",";
    cubes.RANGE_CUT_SEPARATOR_CHAR = "-";
    cubes.SET_CUT_SEPARATOR_CHAR = ";";

    cubes.CUT_STRING_SEPARATOR = /\|/g;
    cubes.DIMENSION_STRING_SEPARATOR = /:/g;
    cubes.PATH_STRING_SEPARATOR = /,/g;
    cubes.RANGE_CUT_SEPARATOR = /-/g;
    cubes.SET_CUT_SEPARATOR = /;/g;

    cubes.PATH_PART_ESCAPE_PATTERN = /([\\!|:;,-])/g;
    cubes.PATH_PART_UNESCAPE_PATTERN = /\\([\\!|:;,-])/g;

    cubes.CUT_PARSE_REGEXP = new RegExp("^(" + cubes.CUT_INVERSION_CHAR + "?)(\\w+)(?:" + cubes.HIERARCHY_PREFIX_CHAR + "(\w+))?" + cubes.DIMENSION_STRING_SEPARATOR_CHAR + "(.*)$")
    cubes.NULL_PART_STRING = '__null__';

    cubes._split_with_negative_lookbehind = function(input, regex, lb) {
      var string = input;
      var match;
      var splits = [];
      while ((match = regex.exec(string)) != null) {
          if ( string.substr(match.index - lb.length, lb.length) != lb ) {
            splits.push(string.substring(0, match.index));
            string = string.substring(Math.min(match.index + match[0].length, string.length), string.length);
          }
          else {
            // match has the lookbehind, must exclude
          }
      }
      splits.push(string);
      return splits;
    }

    cubes._escape_path_part = function(part) {
        if ( part == null ) {
          return cubes.NULL_PART_STRING;
        }
        return part.toString().replace(cubes.PATH_PART_ESCAPE_PATTERN, function(match, b1) { return "\\" + b1; });
    };

    cubes._unescape_path_part = function(part) {
        if ( part === cubes.NULL_PART_STRING ) {
          return null;
        }
        return part.replace(cubes.PATH_PART_UNESCAPE_PATTERN, function(match, b1) { return b1; });
    };

    cubes.string_from_path = function(path){
        var fixed_path = _.map(path || [], function(element) {return cubes._escape_path_part(element);}).join(cubes.PATH_STRING_SEPARATOR_CHAR);
        return fixed_path;
    };

    cubes.path_from_string = function(path_string) {
        var paths = cubes._split_with_negative_lookbehind(path_string, cubes.PATH_STRING_SEPARATOR, '\\');
        var parsed = _.map(paths || [], function(e) { return cubes._unescape_path_part(e); });
        return parsed;
    };

    cubes.cut_from_string = function(cut_string) {
        // parse out invert, dim_name, hierarchy, and path thingy
        var match = cubes.CUT_PARSE_REGEXP.exec(cut_string);
        if (!match) {
          return null;
        }
        var invert = !!(match[1]), 
            dim_name = match[2],
            hierarchy = match[3] || null,
            path_thingy = match[4];
        // if path thingy splits on set separator, make a SetCut.
        var splits = cubes._split_with_negative_lookbehind(path_thingy, cubes.SET_CUT_SEPARATOR, '\\');
        if ( splits.length > 1 ) {
          return new cubes.SetCut(dim_name, hierarchy, _.map(splits, function(ss) { return cubes.path_from_string(ss); }), invert);
        }
        // else if path thingy splits into two on range separator, make a RangeCut.
        splits = cubes._split_with_negative_lookbehind(path_thingy, cubes.RANGE_CUT_SEPARATOR, '\\');
        if ( splits.length == 2 ) {
          var from_path = splits[0] ? cubes.path_from_string(splits[0]) : null;
          var to_path = splits[1] ? cubes.path_from_string(splits[1]) : null;
          return new cubes.RangeCut(dim_name, hierarchy, from_path, to_path, invert);
        }
        // else it's a PointCut.
        return new cubes.PointCut(dim_name, hierarchy, cubes.path_from_string(path_thingy), invert);
    };

    cubes.cell_from_string = function(cube, cut_param_value) {
        var cut_strings = cubes._split_with_negative_lookbehind(cut_param_value, cubes.CUT_STRING_SEPARATOR, '\\');
        var cuts = _.map(cut_strings || [], function(e) { return cubes.cut_from_string(e); });
        var cell = new cubes.Cell(cube);
        cell.cuts = cuts;
        return cell;
    };

    root['cubes'] = cubes;

}).call(this);
