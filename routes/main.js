var Main = require('../models/main');

var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    var currentPage = parseInt(req.query.currentPage) || 0;

    Main.list(currentPage, function(err, result) {
        if(err) {
            return next(err);
        }
        res.send({
            result : result
        });
    });

});

module.exports = router;