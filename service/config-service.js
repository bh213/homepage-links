var util = require("util");
var YAML = require('yamljs');
var fs = require('fs');
var format = require("string-template")

ConfigService.prototype.loadConfig = function () {
    var self = this;

    return new Promise(function (fulfill, reject) {
        console.info("load config %s", self.path);

        return fs.stat(self.path, function (err, stats) {

            console.info('%s, %s', err, JSON.stringify(stats));
            var lm = JSON.stringify(stats.mtime);

            if (self.lastModified != lm) {
                self.lastModified = lm;

                console.info("Loading config file %s", self.path);
                YAML.load(self.path, function (data) {

                    Object.assign(data.bases, process.env);
                    self.config = data;
                    
                    if (!data.groups || !data.colors)
                    {
                        console.error("Invalid config");
                        reject("invalid config no colors or data!");
                        return;
                    }
                    
                    
                    for(var group of data.groups)
                    {
                        console.info("Loading config file %s", group);
                        for(var item of group.items)
                        {
                            item.link = format(item.link, data.bases)
                        }
                    }
                    


                    console.info("Loaded config file %s", JSON.stringify(self.config));
                    fulfill(self.config);
                }, function (error) {
                    console.error('error loading file %s', error);
                    reject(error);
                });
            }
            else fulfill(self.config);
        });
    });
}

function ConfigService(path) {
    this.path = path;
}


module.exports = ConfigService;
