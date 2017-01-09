var express = require('express');
var router = express.Router();
var Color = require('color');

router.get('/', function(req, res, next) {

    var config = router.configService.loadConfig();
    res.render('index', { title: config.title, groups: config.groups, colors: config.colors, color: Color });
});

router.get('*', function(req, res, next) {
    var config = router.configService.loadConfig();

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

});

module.exports = function (configService) {
    router.configService = configService;
    return router;
};
