YAML = require('yamljs');


function loadConfig(path) {
    console.info("Loading config file %s", path);
    this.config = YAML.load(path);
    console.info("Loaded config file %s", JSON.stringify(this.config));
}
function ConfigService(path) {
    var opts = {
        forcePolling: false,  // try event-based watching first
        debounce: 10,         // debounce events in non-polling mode by 10ms
        interval: 60000,       // if we need to poll, do it every 60sec
        persistent: false      // don't end the process while files are watched
    };


    loadConfig.call(this, path);

    this.filewatcher = require('filewatcher');
    this.watcher = this.filewatcher(opts);
    this.watcher.add(path);
    this.watcher.on('change', function (file, stat) {
        console.log('File modified: %s %s', file, stat);
        loadConfig(path)
    });

    this.watcher.on('fallback', function(limit) {
        console.log('Ran out of file handles after watching %s files.', limit);
        console.log('Falling back to polling which uses more CPU.');
        console.log('Run ulimit -n 10000 to increase the limit for open files.');
    });
}


module.exports = ConfigService;
