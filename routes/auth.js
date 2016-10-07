var express = require('express');

var passport = require('passport');

var KakaoStrategy = require('passport-kakao').Strategy;
var KaKoTokenStrategy = require('passport-kakao-token');

var Auth = require('../models/auth');
var router = express.Router();

//새션값에 관련된 함수.

passport.serializeUser(function (user, done) {
    done(null, user.id);
});
passport.deserializeUser(function (id, done) {
    Auth.findCustomer(id, function (err, user) {
        if (err) {
            return done(err);
        }
        done(null, user);
    });
});

//카카오
passport.use(new KakaoStrategy({
        clientID : process.env.KAKAO_APP_ID,
        callbackURL : process.env.KAKAO_CALLBACK_URL,
    },
    function(accessToken, refreshToken, profile, done){
        // 사용자의 정보는 profile에 들어있다.
        Auth.kakaoFindOrCreate(profile, function(err, user) {
            if (err) {
                return done(err);
            }
            return done(null, user);
        });
        console.log('accessToken : ' +accessToken);
    }));

passport.use(new KaKoTokenStrategy({
    clientID: process.env.KAKAO_APP_ID,
}, function (accessToken, refreshToken, profile, done) {
    Auth.kakaoFindOrCreate(profile, function (err, user) {
        if (err) {
            return done(err);
        }
        console.log(user);
        return done(null, user);
    });
}));


//kakao callback url : 안드로이드가없어서 Token을 받아오기위한 TEST URL
router.get('/kakao/callback', passport.authenticate('kakao'), function (req, res, next) {
    res.send({message: 'kakao callback'});
});

//kakao 로그인시 사용하는 API
router.get('/kakao/token', passport.authenticate('kakao-token'), function (req, res, next) {
    if (req.user)
        res.send({
            result: {
                message: '카카오로그인 성공'
            }
        });
    else {
        res.send({
            result : {
                message : '카카오로그인실패'
            }
        });
    }
});


//로그아웃
router.get('/logout', function (req, res, next) {
    req.logout();
    res.send({
        result: {
            message : '로그아웃 완료.'
        }
    });
});

module.exports = router;