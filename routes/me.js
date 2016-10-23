var Me = require('../models/me');
var Saller = require('../models/Saller');
var path = require('path');
var formidable = require('formidable'); //file upload를 위한 모듈

var express = require('express');
var router = express.Router();

//닉네임 중복확인

//    ~~?nickname=필주
router.get('/', function(req, res, next) {
    if(req.query.nickname) {
        var nickname = req.query.nickname;
        Me.nicknameCheck(nickname, function(err, result) {
            if(err) {
                return next(err);
            }
            res.send({
                result : {
                    message : result
                }
            });
        });
    }
});

//닉네임 저장
router.put('/', function(req, res, next) {
    var user = {};
    user.idx = req.user.id;
    user.nickname = req.body.nickname;

    Me.nickname(user, function(err, result) {
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

//셀러모집 삽입 데이터
router.post('/market/saller', function(req, res, next) {
    var saller_u = {};
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

        saller_u.user_idx = req.user.id;
        saller_u.recruitment_title=fields.recruitment_title;
        saller_u.recruitment_contents=fields.recruitment_contents;

        //에러가 아닐시 saller_u fields 값을 추가

        if (files.image) {  //이미지파일이 있을경우 saller_u.recruitment_image에 업로드될 파일의 이름 저장.
            saller_u.recruitment_image = path.basename(files.image.path);
        } else { //파일이 없을경우 image값은 null로 설정.
            saller_u.recruitment_image= null;
        }

        Saller.saller_1(saller_u, function(err, result) {
            if(err) {
                return next(err);
            }
            res.send({
                result : "Success"
            });
        });
    });
});

//셀러모집 리스트
router.get('/market/saller', function(req, res, next) {
    var currentPage = (10*parseInt(req.query.currentPage)) || 0;
    Saller.saller_2(currentPage, function(err, result) {
        if(err) {
            return next(err);
        }
        res.send({
            result : result
        });
    });
});

//셀러모집 댓글달기
router.post('/market/saller/:id/reply', function(req, res, next) {
    var info = {};
    info.user_id = req.user.id;
    info.Recruitment_recruitment_idx= req.params.id;
    info.reply_contents = req.body.reply_contents;

    Saller.saller_3(info, function(err) {
        if(err) {
            return next(err);
        }
        res.send({
            result : "Success"
        });
    });
});

//셀러모집 상세보기
router.get('/market/saller/:id', function(req, res, next) {
    var recruitment_idx = req.params.id;
    Saller.saller_4(recruitment_idx, function(err, results) {
        if(err) {
            return next(err);
        }
        res.send({
            result :  results
        });
    });
});

module.exports = router;