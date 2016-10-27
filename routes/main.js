var Main = require('../models/main');
var formidable = require('formidable');

var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    var info ={};
    var currentPage = (10*parseInt(req.query.currentPage)) || 0;
    info.currentPage = currentPage;

    Main.list(currentPage, function(err, result) {
        if(err) {
            return next(err);
        }
        res.send({
            result : result
        });
    });
});

//마켓 상세보기
router.get('/:id', function(req, res, next) {
    var info = {};
    info.currentPage = (10*parseInt(req.query.currentPage)) || 0;
    info.market_id = req.params.id;
    if (!req.user) {
        info.user_id = 0;
    } else {
        info.user_id = req.user.id;
    }

    Main.market_detail(info, function(err, market, image, review) {
        if (err) {
            return next(err);
        }

        if(market.favorite === null && info.user_id ===0 ) {
            market.favorite = -1;
        } else if (market.favorite === null && info.user_id !==0 ) {
            market.favorite = 0;
        } else {
            market.favorite = 1;
        }

        market.image = image;
        market.review = review;
        res.send({
            result : market
        })
    });
});

//위치, 날짜검색
router.get('/search/:address/:startdate/:enddate', function(req,res,next){
    var currentPage = (10*parseInt(req.query.currentPage)) || 0;

    var search = {};
    // :address = , 구분 예시) 강남, 광진
    // search.address = req.params.address != '*'? req.params.address.replace(',', '|') : undefined;
    search.address = req.params.address.replace(',','|');
    search.startdate = req.params.startdate;
    search.enddate = req.params.enddate;
    search.currentPage= currentPage;

    Main.search(search, function(err, result){
        if(err){
            return next(err);
        }
        res.send({ // 값이 안담겨
            result : result
        });
    });
});

//이름검색
router.get('/searchname/:name', function (req, res, next) {
    var currentPage = (10*parseInt(req.query.currentPage)) || 0;
    var search={};
    search.name = req.params.name;
    search.currentPage = currentPage;

    Main.searchName(search, function(err, result){
        if(err){
            return next(err);
        }
        res.send({
            result : result
        });
    });
});


//좋아요
//로그인한유저만
router.put('/:market_idx', function (req, res, next) {
    var info = {};
    info.market_idx = req.params.market_idx;
    info.user_idx = req.user.id;
    Main.good(info, function(err, result) {
        if (err) {
            return next(err);
        }
        res.send({
            result : {
                message : "Success"
            }
        });
    });
});

//좋아요취소
//로그인한유저만
router.delete('/:market_idx', function (req, res, next) {
    var info = {};
    info.market_idx = req.params.market_idx;
    info.user_idx = req.user.id;
    Main.goodCancel(info, function(err, result) {
        if (err) {
            return next(err);
        }
        res.send({
            result : {
                message : "Success"
            }
        });
    });
});

module.exports = router;