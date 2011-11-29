(function(){
 
//Variables and functions go here.
    var root = this;
    var cubes = { };

    cubes.Server = function(url){ 
        this.url = url;
        this.model = null;
    }
    
    _.extend(cubes.Server.prototype, {
        load_model: function(options){
            options || (options = {})
            var params = {dataType : 'json', type : "GET"};
            // params.url = getUrl(model) || urlError();

            params.url = this.url + "model"
            console.log("loading cubes model from " + params.url)

            options.success = this._parse_model
            return $.ajax(_.extend(params, options));
        },

        _parse_model: function(object){
            console.log("model loaded")
            console.log(object)
            this.model = new cubes.Model(object)
            console.log("dimension CPV:")
            console.log(this.model.dimension("cpv"))
        }
    })
    
    cubes.Model = function(obj){
        // desc - model description
        this.parse(obj)
    }

    _.extend(cubes.Model.prototype, {
        parse: function(desc) {
            model = this;
            
            !desc.name || (model.name = desc.name)
            !desc.label || (model.label = desc.label)
            !desc.description || (model.description = desc.description)
            !desc.locale || (model.locale = desc.locale)

            model.dimensions = []

            if(desc.dimensions) {
                for(i in desc.dimensions) {
                    dim = new cubes.Dimension(desc.dimensions[i])
                    model.dimensions.push(dim)
                }
            }
        },
        
        dimension: function(name) {
            // Return a dimension with given name
            return _.find(this.dimensions, function(dim){return dim.name == name;})
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

    root['cubes'] = cubes;
}).call(this);
