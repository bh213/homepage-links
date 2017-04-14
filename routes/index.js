var express = require('express');
var router = express.Router();
var Color = require('color');
var format = require("string-template")
router.get('/', function(req, res, next) {

    router.configService.loadConfig().then(function (config) {
        res.render('index', { title: config.title, groups: config.groups, colors: config.colors, color: Color, bases: config.bases });
    }, function (error) {
        console.error("on rejected", error);
        res.render('error', {error:error});
        }
    ).catch(function (exception) {
        console.error("Exception in /", error);
        res.render('error');
    });
});

router.get('*', function(req, res, next) {
    router.configService.loadConfig().then(function(config){
        for(var group of config.groups)
        {
            for(var item of group.items)
                if (req.path == item.url)
                {
                    console.info("redirecting to " + item.link);
                    res.redirect(item.link);
                    return;
                }
        }
        console.error("Route for " + req.path + " not found");
        res.send('Route not found', 404);

    },function (error) {
        console.error('Error %s in gets', error)
        res.send('Error ' + error, 404);
    });


});

module.exports = function (configService) {
    router.configService = configService;
    return router;
};
