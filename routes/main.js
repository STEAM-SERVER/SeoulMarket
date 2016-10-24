var isAuthenticated = require('./common').isAuthenticated;

var Main = require('../models/main');
var formidable = require('formidable');
var path = require('path');
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    var currentPage = (10*parseInt(req.query.currentPage)) || 0;
    var info ={};
    info.currentPage = currentPage;
    info.searchAddress = req.query.searchAddress;
    info.startDate=req.query.startDate;
    info.endDate= req.query.endDate;

    // 검색조건 없을때
    if (!req.query.searchAddress && !req.query.startDate && !req.query.endDate ) {
        Main.list(currentPage, function(err, result) {
            if(err) {
                return next(err);
            }
            res.send({
                result : result
            });
        });

        // 주소검색만 -> 날짜 전체선택
    }
    // else if(req.query.searchAddress && !req.query.startDate && !req.query.endDate) {
    //     info.searchAddress = req.query.searchAddress;
    //
    //     Main.searchAddress(info, function(err, result) {
    //         if(err) {
    //             return next(err);
    //         }
    //         res.send({
    //             result : result
    //         });
    //     });
    //
    //     //날짜검색만 -> 주소 전체선택
    // }
    // else if(!req.query.searchAddress && req.query.startDate && req.query.endDate){
    //     info.startDate=req.query.startDate;
    //     info.endDate= req.query.endDate;
    //
    //     Main.searchDate(info, function (err, result) {
    //         if(err){
    //             return next(err);
    //         }
    //         res.send({
    //             result : result
    //         });
    //     });
    //     // 주소, 날짜검색
    // }
    // else if( req.query.searchAddress && req.query.startDate && req.query.endDate){
    //     info.searchAddress = req.query.searchAddress;
    //     info.startDate=req.query.startDate;
    //     info.endDate= req.query.endDate;
    //
    //     Main.search(info, function(err, result){
    //         if(err){
    //             return next(err);
    //         }
    //         res.send({
    //             result : result
    //         });
    //     });
    //
    // }
    else {
        next(new Error('404 Not found'));
    }
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
// 마켓 후기 등록
router.post('/:id', isAuthenticated , function (req, res, next) {
    // var review = {};
    // review.contents = req.body.review_contents;
    // review.img = req.body.review_img;
    // review.market_idx = req.body.market_idx;
    // review.user_idx = req.user.id;

    // Main.write(review, function(err, result) {
    //     if(err) {
    //         return next(err);
    //     }
    //     res.send({
    //         result : {
    //             message : "Success"
    //         }
    //     });
    // });

    var review = {};

    //파일이 존재할 경우
    var form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, '../uploads/images');
    form.keepExtensions = true; // 업로드할 파일의 확장자를 유지시킬경우 true
    form.multiples = false; // false 옵션을 주었기때문에, 단일 사진만 허용.

    form.parse(req, function (err, fields, files) {
        //fields 는 업로드 파일이 아닌 다른 옵션들
        //files는 파일
        if (err) {
            return next(err);
        }
        review.contents = fields.review_contents;
        // review.market_idx = req.body.market_idx;
        review.market_idx = fields.market_idx;
        review.user_idx = req.user.id;


        //에러가 아닐시 review fields 값을 추가
        if (files.image) {  //이미지파일이 있을경우 review.img에 업로드될 파일의 이름 저장.
            review.img = path.basename(files.image.path);
        } else { //파일이 없을경우 image값은 null로 설정.
            review.img= null;
        }
        Main.write(review, function(err, result) {
            if(err) {
                return next(err);
            }
            res.send({
                result : "Success"
            });
        });
    });

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