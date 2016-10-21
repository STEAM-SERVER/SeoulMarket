var Me = require('../models/me');

var express = require('express');
var router = express.Router();

//닉네임 중복확인
router.get('/', function(req, res, next) {
    if(req.query.nickname) {
        var nickname = req.query.nickname;
        Me.nicknameCheck(nickname, function(err, result) {
            if(err) {
                return next(err);
            }
            res.send({
                result : {
                    message : "Success",
                    state : result
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

module.exports = router;