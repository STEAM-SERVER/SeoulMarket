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

router.get('/:id', function(req, res, next) {
    var info = {};
    info.market_id = req.params.id;
    info.user_id = req.user.id;

    Main.market_detail(info, function(err, market, image, review) {
        if (err) {
            return next(err);
        }

        market.image = image;
        market.review = review;
        res.send({
            result : market
        })
    });
});


module.exports = router;