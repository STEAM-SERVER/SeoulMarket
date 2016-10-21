var isAuthenticated = require('./common').isAuthenticated;
var Review = require('../models/review');
var express = require('express');
var router = express.Router();

router.post('/', isAuthenticated , function (req, res, next) {
    var review = {};
    review.contents = req.body.review_contents;
    review.img = req.body.review_img;
    review.market_idx = req.body.market_idx;
    review.user_idx = req.user.id;

    Review.write(review, function(err, result) {
        if(err) {
            return next(err);
        }
        res.send({
            result : {
                message : "Success"
            }
        });
    });
});

module.exports=router;