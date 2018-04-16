var util = require("util");
var YAML = require('yamljs');
var fs = require('fs');
var format = require("string-template")
const { promisify } = require('util');
const getStats = promisify(fs.stat);

ConfigService.prototype.loadConfig = async function() {
    var self = this;
    console.info("load config %s", self.path);

    try {
        stats = await getStats(self.path);

        console.info('%s',  JSON.stringify(stats));
        var lm = JSON.stringify(stats.mtime);

        if (self.lastModified != lm) {
            self.lastModified = lm;

            console.info("Loading config file %s", self.path);
            let data = await YAML.load(self.path);
            
            if (data == null) throw "Data not loaded";
            
            if (!data.bases) data.bases={};
            Object.assign(data.bases, process.env);
            
            self.config = data;
            
            if (!data.groups || !data.colors) {
                console.error("Invalid config");
                throw "No group or data fields";
            }

            for (var group of data.groups) {
                if (!group.palette) throw "Group " + group.name + " has no palette";
                if (!data.colors[group.palette]) throw "Group " + group.name + " has invalid palette " + group.palette;
                for (var item of group.items) {
                    item.link = format(item.link, data.bases)
                }
            }

            console.info("Loaded config file");

        }
        return self.config;
    } catch (err) {
        console.error("error loading config", err);
        throw err;
    }
}

function ConfigService(path) {
    this.path = path;
}

module.exports = ConfigService;