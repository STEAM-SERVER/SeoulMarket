var dbPool = require('../models/common').dbPool;

function findCustomer(customerId, callback) {
    var sql = 'SELECT idx, email, kakaoid FROM User WHERE idx = ?';
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql, [customerId], function(err, results) {
            dbConn.release();
            if (err) {
                return callback(err);
            }
            var user = {};
            if(results[0]){
                user.id = results[0].idx;
                user.name = results[0].name;
                user.email = results[0].email;
            }
            callback(null, user);
        });
    });
}

//facebook로그인 관련함수
/*
function facebookFindOrCreate(profile, callback) {
    var sql_facebookid = "select idx, email, facebookid from user where facebookid = ?";
    var sql_insert_facebookid = "insert into user(facebookid) value (?)";

    dbPool.getConnection(function(err, dbConn){
        if (err) {
            return callback(err);
        }
        dbConn.query(sql_facebookid, [profile.id], function(err, results) {
            if (err) {
                dbConn.release();
                return callback(err);
            }

            if (results.length !== 0) {
                dbConn.release();
                var user = {};
                user.id = results[0].idx;
                user.facebookid = results[0].facebookid;
                return callback(null, user);
            }

            dbConn.query(sql_insert_facebookid, [profile.id], function(err, result) {
                if (err) {
                    dbConn.release();
                    return callback(err);
                }
                dbConn.release();
                var user = {};
                user.id = result.insertId;
                user.facebookid = profile.id;
                return callback(null, user);
            });
        });
    });
}
*/
//kakao로그인관련함수
function kakaoFindOrCreate(profile, callback) {
    var sql_kakaoid = "select idx, email, kakaoid from User where kakaoid = ?";
    var sql_insert_kakaoid = "insert into User(kakaoid) value (?)";

    dbPool.getConnection(function(err, dbConn){
        if (err) {
            return callback(err);
        }
        dbConn.query(sql_kakaoid, [profile.id], function(err, results) {
            if (err) {
                dbConn.release();
                return callback(err);
            }
            if (results.length !== 0) {
                dbConn.release();
                var user = {};
                user.id = results[0].idx;
                user.kakaoid = results[0].kakaoid;
                return callback(null, user);
            }

            dbConn.query(sql_insert_kakaoid, [profile.id], function(err, result) {
                if (err) {
                    dbConn.release();
                    return callback(err);
                }
                dbConn.release();
                var user = {};
                user.id = result.insertId;
                user.kakaoid = profile.id;
                return callback(null, user);
            });
        });
    });
}

module.exports.findCustomer = findCustomer;
//module.exports.facebookFindOrCreate = facebookFindOrCreate;
module.exports.kakaoFindOrCreate = kakaoFindOrCreate;

