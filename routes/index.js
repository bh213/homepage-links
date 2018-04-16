var express = require('express');
var router = express.Router();
var Color = require('color');
var format = require("string-template")
router.get('/', async function (req, res, next) {


    try {
        let config = await router.configService.loadConfig();
        res.render('index', {
            title: config.title,
            groups: config.groups,
            colors: config.colors,
            color: Color,
            bases: config.bases
        });
    } catch (e) {
        console.error("on rejected", e);
        res.render('error', {
            error: e
        });
    }

});

router.get('*', async function (req, res, next) {
    try {
        let config = await router.configService.loadConfig();
        for (var group of config.groups) {
            for (var item of group.items)
                if (req.path == item.url) {
                    console.info("redirecting to " + item.link);
                    res.redirect(item.link);
                    return;
                }
        }
        const error = "Route for " + req.path + " not found";
        console.error(error);
        res.status(404).send(error)
    } catch (e) {
        console.error('Error %s in gets', e)
        res.status(404).send("Error:" + e)
    }
});

module.exports = function (configService) {
    router.configService = configService;
    return router;
};