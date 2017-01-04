var express = require('express');
var router = express.Router();
var Color = require('color');

/* GET home page. */
router.get('/', function(req, res, next) {
    var config = router.config;
    res.render('index', { title: config.title, items: config.items, colors: config.colors["default"], color: Color });
});

router.get('*', function(req, res, next) {
    var config = router.config;

    for(var item of config.items)
    {
        if (req.path == item.url)
        {
            console.info("redirecting to " + item.link);
            res.redirect(item.link);
        }

    }

    console.error("Route for " + req.path + " not found");
    res.send('Route not found', 404);

});

module.exports = router;
