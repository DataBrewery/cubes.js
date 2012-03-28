(function(){
 
//Variables and functions go here.
    var root = this;
    var cubes = { };

    cubes.Server = function(url){ 
        this.url = url;
        this.model = null;
        
        // Server callbacks
        this.onConnect = null;
        this.onError = null;
    }
    
    _.extend( cubes.Server.prototype, {
        
        _request: function(path, params, options) {
            options || (options = {})

            var request_params = {dataType : 'json', type : "GET"};

            request_params.url = this.url + path;
            console.log("cubes request: " + request_params.url)

            return $.ajax(_.extend(request_params, options));
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
                if (!model) return false;
                if (server.onConnect) server.onConnect(model);
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
            model = this;
            
            !desc.name        || (model.name = desc.name);
            !desc.label       || (model.label = desc.label);
            !desc.description || (model.description = desc.description);
            !desc.locale      || (model.locale = desc.locale);
            model.locales = desc.locales;

            model.dimensions = []

            if(desc.dimensions) {
                for(i in desc.dimensions) {
                    dim = new cubes.Dimension(desc.dimensions[i])
                    model.dimensions.push(dim)
                }
            }

            model.cubes = []

            if(desc.cubes) {
                for(i in desc.cubes) {
                    cube = new cubes.Cube(desc.cubes[i], this)
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
                obj = new cubes.Attribute(desc.measures[i])
                this.measures.push(obj)
            }

            this.details = []

            for(i in desc.details) {
                obj = new cubes.Attribute(desc.details[i])
                this.details.push(obj)
            }

            this.dimensions = _.map(desc.dimensions, function(name) {return model.dimension(name)} )
        }

    })
    
    cubes.Dimension = function(obj){
        this.parse(obj)
    }
    
    _.extend(cubes.Dimension.prototype, {
        parse: function(desc) {
            dim = this;
            dim.name = desc.name;
            !desc.label || (dim.label = desc.label);
            !desc.description || (dim.description = desc.description);

            dim.levels = {};

            if(desc.levels) {
                for(i in desc.levels) {
                    level = new cubes.Level(desc.levels[i])
                    dim.levels[level.name] = level
                }
            };

            this.hierarchies = {};

            if(desc.hierarchies) {
                for(i in desc.hierarchies) {
                    hier = new cubes.Hierarchy(desc.hierarchies[i], this)
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
        }
    } )

    cubes.Hierarchy = function(obj, dim){
        this.parse(obj, dim)
    }

    _.extend(cubes.Hierarchy.prototype, {
        parse: function(desc, dim) {
            hier = this;
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
            level = this;
            level.name = desc.name
            !desc.label || (level.label = desc.label)
            !desc.description || (level.description = desc.description)
            level._key = desc.key
            level._label_attribute = desc.label_attribute
            
            level.attributes = []

            if(desc.attributes) {
                for(i in desc.attributes) {
                    attr = new cubes.Attribute(desc.attributes[i])
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

    cubes.Browser = function(cube, url){
        this.cube = cube
        this.url = url
    };

    _.extend(cubes.Browser.prototype, {
        full_cube: function(dimension) {
            return new cubes.Cell(self.cube)
        },
        aggregate: function(cell) {
            var params = {dataType : 'json', type : "GET"};

            params.url = this.url + "/cube/" + this.cube.name + "/aggregate"
            if(cell) {
                params.url += "?cut=" + cell
            };

            // FIXME: continue here
            console.log("AGGREGATE URL: " + params.url)
            
            var options = {
                success: function(obj) {
                    console.log("aggregation success")
                    console.log(obj)
                },
                error: function(obj) {
                    console.log("aggregation error")
                    console.log(obj)
                }
            }
            return $.ajax(_.extend(params, options));
        }
    });

    cubes.Cell = function(cube){
        this.cube = cube;
        this.cuts = [];
    };

    _.extend(cubes.Cell.prototype, {
        slice: function(dimension, path) {
            cuts = _.reject(cuts, function(cut) {cut.dimension == dimension} )
            if(path) {
                cut = cubes.PointCut(dimension, path)
                cuts.push(cut)
            }
            cell = cubes.Cell(self.cube);
            cell.cuts = cuts;
            return cell;
        },

        toString:function() {
            strings = _.map(this.cuts, function(cut) {return cut.toString()});
            string = strings.join(cubes.CUT_STRING_SEPARATOR);
            return string;
        }
    });

    cubes.PointCut = function(dimension, path){
        this.dimension = dimension;
        this.path = path;
    };

    _.extend(cubes.PointCut.prototype, {
        toString: function() {
            path_str = cubes.string_from_path(this.path)
            string = this.dimension.name + cubes.DIMENSION_STRING_SEPARATOR + path_str
            
            return string
        }
    });

    cubes.DIMENSION_STRING_SEPARATOR = ":";
    cubes.CUT_STRING_SEPARATOR = "|";
    cubes.PATH_STRING_SEPARATOR = ",";

    cubes.string_from_path = function(path){
        fixed_path = _.map(path, function(element) {return element || ""})
        string = fixed_path.join(cubes.PATH_STRING_SEPARATOR)
        return string;
    }

    root['cubes'] = cubes;
}).call(this);
