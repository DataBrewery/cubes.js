(function(){
 
    // Variables and functions go here.
    var root = this;
    var cubes = { };

    cubes.Server = function(url){
        
        // Represents Cubes Slicer Server connection.
        // 
        // Attributes:
        // 
        // * `url`: Slicer API URL * `model`: downloaded model from the slicer URL
        // 
        // Callbacks:
        // 
        // * `onConnect`: called when successful connection is established and when
        //                model is loaded
        // * `onError`: called when an error occures during connection process

        this.url = url;
        this.model = null;
    }
    
    _.extend( cubes.Server.prototype, {
    
        // Build a slicer HTTP request
        _request: function(path, params, options) { options || (options = {})
            var request_params = {dataType : 'json', type : "GET"};

            request_params.url = this.url + path;
            console.log("cubes request: " + request_params.url)

            return $.ajax(_.extend(request_params, options));
        },
        
        query: function(query, cube, args, callback) {
            var params = {dataType : 'json', type : "GET"};

            if(cube.hasOwnProperty("name"))
                cube_name = cube.name
            else
                cube_name = cube
            
            params.url = this.url + "/cube/" + cube_name + "/" + query
            params.data = args

            if(args && args.cut)
                params.data.cut = params.data.cut.toString()

            params.success = function(obj) {
                console.log("browser query ok", obj)
                callback(obj)
            }
            params.error = function(obj) {
                console.log("browser query error", obj)
                // FIXME: Some error handler here
            }

            console.log("cubes query: ", params.url, params.data)
            return $.ajax(params)
        },
        
        connect: function(url) {
            var self = this;

            this.url = url

            options = {error: this._onError}

            options.success = function(resp, status, xhr) {
                self.server_version = resp.server_version;
                self.api_version = resp.api_version;
                console.log("slicer connected: version=" + self.server_version +
                                " API=" + self.api_version)
                self._load_model()
            };

            this._request('version', null, options);
        },

        _load_model: function() {
            var self = this;

            options = {error: this._onError}

            options.success = function(resp, status, xhr) {
                model = self._parse_model(resp)

                // FIXME: handle model parse failure
                if (!model)
                    return false;
                if (server.onConnect)
                    server.onConnect(model);
            };

            return this._request('model', null, options);
        },

        _onError: function(xhr, textStatus) {
            if (server.onError)
                server.onError(xhr, textStatus)
            else
                console.log("cubes server error: " + textStatus)
        },

        _parse_model: function(object) {
            console.log("parsing loaded model")
            model = new cubes.Model(object);
            return model;
        }
    })
    
    cubes.Model = function(obj){
        // obj - model description
        this.parse(obj)
    }

    _.extend(cubes.Model.prototype, {
        parse: function(desc) {
            var model = this;
            
            !desc.name        || (model.name = desc.name);
            !desc.label       || (model.label = desc.label);
            !desc.description || (model.description = desc.description);
            !desc.locale      || (model.locale = desc.locale);
            model.locales = desc.locales;

            model.dimensions = []

            if(desc.dimensions) {
                for(i in desc.dimensions) {
                    var dim = new cubes.Dimension(desc.dimensions[i])
                    model.dimensions.push(dim)
                }
            }

            model.cubes = []

            if(desc.cubes) {
                for(i in desc.cubes) {
                    var cube = new cubes.Cube(desc.cubes[i], this)
                    model.cubes.push(cube)
                }
            }

        },
        
        dimension: function(name) {
            // Return a dimension with given name
            return _.find(this.dimensions, function(dim){return dim.name == name;})
        },

        cube: function(name) {
            // Return a dimension with given name
            return _.find(this.cubes, function(obj){return obj.name == name;})
        }
        
    })

    cubes.Cube = function(obj, model){
        this.url = null;
        this.parse(obj, model)
    }
    
    _.extend(cubes.Cube.prototype, {
        parse: function(desc, model) {
            this.name = desc.name;
            !desc.label || (this.label = desc.label);
            !desc.description || (this.description = desc.description);
            !desc.key || (this.key = desc.key);

            this.measures = []

            for(i in desc.measures) {
                var obj = new cubes.Attribute(desc.measures[i])
                this.measures.push(obj)
            }

            this.details = []

            for(i in desc.details) {
                var obj = new cubes.Attribute(desc.details[i])
                this.details.push(obj)
            }

            this.dimensions = _.map(desc.dimensions, function(name) {return model.dimension(name)} )
        },
        dimension: function(name) {
            // Return a dimension with given name
            return _.find(this.dimensions, function(obj){return obj.name == obj;})
        }

    })
    
    cubes.Dimension = function(obj){
        this.parse(obj)
    }
    
    _.extend(cubes.Dimension.prototype, {
        parse: function(desc) {
            var dim = this;
            dim.name = desc.name;
            !desc.label || (dim.label = desc.label);
            !desc.description || (dim.description = desc.description);
            !desc.default_hierarchy_name || (dim.default_hierarchy_name = desc.default_hierarchy_name);

            dim.levels = {};

            if(desc.levels) {
                for(i in desc.levels) {
                    var level = new cubes.Level(desc.levels[i])
                    dim.levels[level.name] = level
                }
            };

            this.hierarchies = {};

            if(desc.hierarchies) {
                for(i in desc.hierarchies) {
                    var hier = new cubes.Hierarchy(desc.hierarchies[i], this)
                    dim.hierarchies[hier.name] = hier
                }
            }
            
        },
        level: function(name) {
            // Return a level with given name
            return _.find(this.levels, function(obj){return obj.name == obj;})
        },
        toString: function(desc) {
            return this.name;
        },
        display_label: function() {
            return this.label || this.name;
        },
        hierarchy: function(name) {
            if(name)
                return this.hierarchies[name]
            else
                return this.hierarchies[default_hierarchy_name]
        }
    } )

    cubes.Hierarchy = function(obj, dim){
        this.parse(obj, dim)
    }

    _.extend(cubes.Hierarchy.prototype, {
        parse: function(desc, dim) {
            var hier = this;
            hier.name = desc.name
            !desc.label || (hier.label = desc.label)
            !desc.description || (hier.description = desc.description)
            
            hier._level_names = []

            for(i in desc.levels) {
                hier._level_names.push(desc.levels[i])
            }
            
            hier.levels = _.map(hier._level_names, function(name) {return dim.level(name)} )
        }
    });

    cubes.Level = function(obj){
        this.parse(obj)
    }

    _.extend(cubes.Level.prototype, {
        parse: function(desc) {
            var level = this;
            level.name = desc.name
            !desc.label || (level.label = desc.label)
            !desc.description || (level.description = desc.description)
            level._key = desc.key
            level._label_attribute = desc.label_attribute
            
            level.attributes = []

            if(desc.attributes) {
                for(i in desc.attributes) {
                    var attr = new cubes.Attribute(desc.attributes[i])
                    level.attributes.push(attr)
                }
            }
        },
        
        key: function(desc) {
            // Key attribute is either explicitly specified or it is first attribute in the list
            return level._key || level.attributes[0];
        },
        label_attribute: function(desc) {
            // Label attribute is either explicitly specified or it is second attribute if there are more
            // than one, otherwise it is first
            return level._label_attribute || level.attributes[1] || level.attributes[0];
        },
        toString: function(desc) {
            return this.name;
        }
    });

    cubes.Attribute = function(obj){
        this.name = obj.name;
        this.label = obj.label;
        this.order = obj.order;
        this.locales = obj.locales;
    };

    _.extend(cubes.Level.prototype, {
        full_name: function(dimension) {
            return dimension + "." + this.name
        }
    });

    cubes.Browser = function(server, cube){
        this.cube = cube
        this.server = server
    };

    _.extend(cubes.Browser.prototype, {
        full_cube: function(dimension) {
            return new cubes.Cell(self.cube)
        },
        aggregate: function(cell, drilldown, callback) {
            var args = {}

            if (cell) args.cut = cell
            if (drilldown) args.drilldown = drilldown

            this.server.query("aggregate", this.cube, args, callback)
        },
        full_cube: function(){
            return new cubes.Cell(this)
        }
    });

    cubes.Cell = function(cube){
        this.cube = cube;
        this.cuts = [];
    };

    _.extend(cubes.Cell.prototype, {
        slice: function(dimension, path) {
            var cuts = _.reject(cuts, function(cut) {cut.dimension == dimension} )
            if(path) {
                cut = cubes.PointCut(dimension, path)
                cuts.push(cut)
            }
            var cell = cubes.Cell(self.cube);
            cell.cuts = cuts;
            return cell;
        },

        toString:function() {
            var strings
            var result

            if(this.cuts && this.cuts.length >= 1)
                strings = _.map(this.cuts, function(cut) {
                                                return cut.toString()
                                            })
            else
                strings = []
            
            result = strings.join(cubes.CUT_STRING_SEPARATOR);
                
            return result;
        },
        
        cut_for_dimension: function(name) {
            return _.find(this.cuts, function(cut){
                return cut.dimension.name == name
            })
        }
    });

    cubes.PointCut = function(dimension, path){
        this.dimension = dimension;
        this.path = path;
    };

    _.extend(cubes.PointCut.prototype, {
        toString: function() {
            var path_str = cubes.string_from_path(this.path)
            var string = this.dimension.name + cubes.DIMENSION_STRING_SEPARATOR + path_str
            
            return string
        }
    });

    cubes.SetCut = function(dimension, paths){
        this.dimension = dimension;
        this.paths = paths;
    };

    cubes.DIMENSION_STRING_SEPARATOR = ":";
    cubes.CUT_STRING_SEPARATOR = "|";
    cubes.PATH_STRING_SEPARATOR = ",";

    cubes.string_from_path = function(path){
        var fixed_path = _.map(path, function(element) {return element || ""})
        var string = fixed_path.join(cubes.PATH_STRING_SEPARATOR)
        return string;
    }

    root['cubes'] = cubes;
}).call(this);
