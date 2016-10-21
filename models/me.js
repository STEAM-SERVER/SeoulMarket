var dbPool = require('../models/common').dbPool;

//닉네임 중복확인함수
function nicknameCheck(nickname, callback) {
    var sql_select_nickname = "SELECT user_nickname FROM User WHERE user_nickname = ?";
    var check = "Ok";
    dbPool.getConnection(function(err, dbConn) {
        dbConn.query(sql_select_nickname, [nickname], function(err, result) {
            dbConn.release();
            if(err) {
                return callback(err);
            }
            if(result[0]) {
                check="No";
            }
            callback(null, check);
        });
    });
}

//닉네임 저장함수
function nickname(user, callback) {
    var sql_insert_nickname = "UPDATE User SET user_nickname = ? WHERE user_idx = ?";
    dbPool.getConnection(function(err, dbConn) {
        dbConn.query(sql_insert_nickname, [user.nickname, user.idx], function(err, result) {
            dbConn.release();
            if(err) {
                return callback(err);
            }
            callback(null, result);
        });
    });
}


module.exports.nickname = nickname;
module.exports.nicknameCheck = nicknameCheck;