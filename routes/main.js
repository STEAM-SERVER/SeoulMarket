var Main = require('../models/main');
var formidable = require('formidable');

var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    var currentPage = parseInt(req.query.currentPage) || 0;

    if (!req.query.searchAddress) {
        Main.list(currentPage, function(err, result) {
            if(err) {
                return next(err);
            }
            res.send({
                result : result
            });
        });
    } else if(req.query.searchAddress) {
        var info ={};
        info.currentPage = currentPage;
        info.address = req.query.searchAddress;

        Main.search(info, function(err, result) {
            if(err) {
                return next(err);
            }
            res.send({
                result : result
            });
        });
    } else {
        next(new Error('404 Not found'));
    }
});



//main?currentPage=&searchAddress=


module.exports = router;