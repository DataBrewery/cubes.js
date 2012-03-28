$(function(){ /* jQuery.ready */

// Initialization

var server = new cubes.Server()
window.server = server

var connect = function(){
    url = $("#slicer_url").val()
    if(url[url.length-1] != '/') {
        url += '/'
    }
    console.log("connecting to slicer at URL: " + url)

    server.onConnect = model_loaded;
    server.connect(url)
};


var model_loaded = function(model) {
    window.model = model;

    var source   = $("#info-view").html();
    var template = Handlebars.compile(source);

    var context = {  api_version: server.api_version, 
                     server_version: server.server_version,
                     model: model,
                     cubes: model.cubes,
                     cube_count: model.cubes.length}
    var html    = template(context);

    var view = $("#info-tab");
    view.empty();
    view.append(html);
    // _.each(model.cubes, this.display_cube)
};


$('#slicer_url_form').submit(connect)
$('#connect').click(connect)

// Connect to the local server (by default) and select 'Info' tab

var default_slicer_url = "http://localhost:5000";
$("#slicer_url").val(default_slicer_url);

$('.nav a:first').tab('show');

connect();

})