YAML = require('yamljs');
//var md5= require('md5');

/*
var http = require('http');
var fs = require('fs');

var download = function(url, dest, cb) {
    var file = fs.createWriteStream(dest);
    var request = http.get(url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
            file.close(cb);
        });
    });
};
*/

ConfigService.prototype.loadConfig =function() {

    fs.stat(this.path, function(err, stats){
        var mtime = new Date(util.inspect(stats.mtime));
        console.log(mtime);
    });
    console.log(mtime);

    console.info("Loading config file %s", this.path);
    this.config = YAML.load(this.path);
    this.lastChange =
    console.info("Loaded config file %s", JSON.stringify(this.config));
    return this.config;

    /* for(var group of this.config.groups)
     {
     for(var item of group.items)
     {
     loadFavicon(item.link);

     }

     }*/

}

/*function loadFavicon(url)
{
    var fetchFavicons = require('@meltwater/fetch-favicon').fetchFavicons
    var favIcons = fetchFavicons(url, 160).then(function (data) {
        console.log("favicons %s, %s", url, JSON.stringify(data));
    })

}*/



function ConfigService(path) {
    var self = this;
    this.path = path;

    this.loadConfig();

}


module.exports = ConfigService;
