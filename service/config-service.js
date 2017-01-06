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

function loadConfig(path) {
    console.info("Loading config file %s", path);
    this.config = YAML.load(path);
    console.info("Loaded config file %s", JSON.stringify(this.config));

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
    var opts = {
        forcePolling: false,  // try event-based watching first
        debounce: 10,         // debounce events in non-polling mode by 10ms
        interval: 60000,       // if we need to poll, do it every 60sec
        persistent: false      // don't end the process while files are watched
    };

    loadConfig.call(self, path);

    this.filewatcher = require('filewatcher');
    this.watcher = this.filewatcher(opts);
    this.watcher.add(path);
    this.watcher.on('change', function (file, stat) {
        console.log('File modified: %s %s', file, stat);
        loadConfig.call(self, path);
    });

    this.watcher.on('fallback', function(limit) {
        console.log('Ran out of file handles after watching %s files.', limit);
        console.log('Falling back to polling which uses more CPU.');
        console.log('Run ulimit -n 10000 to increase the limit for open files.');
    });
}


module.exports = ConfigService;
