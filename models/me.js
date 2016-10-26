var dbPool = require('../models/common').dbPool;
var async = require('async');
//닉네임 중복확인함수
function nicknameCheck(nickname, callback) {
    var sql_select_nickname = "SELECT user_nickname FROM User WHERE user_nickname = ?";
    var check = "Success";
    dbPool.getConnection(function(err, dbConn) {
        dbConn.query(sql_select_nickname, [nickname], function(err, result) {
            dbConn.release();
            if(err) {
                return callback(err);
            }
            if(result[0]) {
                check="Fail";
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

//마켓등록함수 --> 쿼리는 안복잡
function marketUploads(marketinfo ,callback) {
    var sql_insert_market="INSERT INTO " +
                           "Market(market_name, user_idx, market_address, market_host, market_contents, market_tag, market_point, market_tell, market_startdate, market_enddate, market_url) " +
                           "VALUES (?, ?, ?, ?, ?, ?, point(?, ?), ?, ?, ?, ?) ";
    var sql_insert_img ="INSERT INTO Image(market_idx, image_url) VALUES(?, ?);";
    var sql_update_img_type ="UPDATE Image SET image_type = 1 WHERE market_idx = ? LIMIT 1" ;
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        /*
         트랜젝션관리 --> release()는 성공 or 실패경우시에 실행.
         1. 성공할경우 : commit
         2. 실패경우 : rollback
         */
        dbConn.beginTransaction(function(err) {
            if (err) {
                return callback(err);
            }
            async.series([market_insert, img_insert, img_type_update], function(err, results) {
                if (err) {
                    return dbConn.rollback(function() { //중간에 에러날경우 롤백!
                        dbConn.release();
                        callback(err);
                    });
                }
                dbConn.commit(function() {  //전부다 성공할경우 commit
                    dbConn.release();
                    callback(null, results);
                });
            });

            function market_insert(callback) {  //Market테이블에 정보 insert 함수
                dbConn.query(sql_insert_market, [marketinfo.market_name, marketinfo.user_idx, marketinfo.market_address, marketinfo.market_host, marketinfo.market_contents ,
                marketinfo.market_tag, marketinfo.longitude, marketinfo.latitude, marketinfo.market_tell, marketinfo.market_startdate, marketinfo.market_enddate, marketinfo.market_url], function(err, result) {
                    if (err) {
                        return callback(err);
                    }
                    marketinfo.market_id = result.insertId;
                    callback(null, 'market insert 성공');
                });
            }
            function img_insert(callback) {  //Image 테이블에 이미지정보 insert 함수
                async.each(marketinfo.imgPath, function(item, done) {
                        dbConn.query(sql_insert_img, [marketinfo.market_id, item], function(err, result) {
                            if (err) {
                                return callback(err);
                            }
                            callback(null, 'img insert 성공');
                        });
                }, function(err) {
                    if (err) {
                        return callback(err);
                    }
                });
            }
            function img_type_update(callback) {
                // Image테이블에 대표사진 update 함수
                // 급한대로 하드코딩해서 나중에 수정해야함!
                dbConn.query(sql_update_img_type, [marketinfo.market_id], function(err, result) {
                    if (err) {
                        return callback(err);
                    }
                    callback(null, 'img type update 성공!');
                });
            }
        });
    });
}

//내가등록한마켓보기
function marketEnrollment(info, callback) {
    var sql_select_main = "SELECT M.market_idx, M.market_address,  M.market_name, I.image_url, M.market_count, "+
                          "TO_DAYS(M.market_enddate)-TO_DAYS(NOW()) market_state, "+
                          "date_format(convert_tz(M.market_startdate, '+00:00', '+00:00'), '%Y-%m-%d') market_startdate, "+
                          "date_format(convert_tz(M.market_enddate, '+00:00', '+00:00'), '%Y-%m-%d') market_enddate, "+
                          "I.image_type, M.user_idx "+
                          "FROM Market M JOIN Image I ON (M.market_idx = I.market_idx) "+
                          "WHERE I.image_type = 1 AND M.user_idx = ? ORDER BY M.market_idx DESC LIMIT ?, 10 ";
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        var list = [];
        dbConn.query( sql_select_main, [info.user_idx, info.currentPage], function(err, result) {
            dbConn.release();
            if(err) {
                return callback(err);
            }

            async.each(result, function(item, cb) {
                list.push({
                    idx : item.market_idx,
                    address : item.market_address,
                    state : item.market_state,
                    image : "http://localhost:3000/images/"+item.image_url,
                    marketname : item.market_name,
                    market_state : item.market_state,
                    market_count : item.market_count,
                    market_startdate : item.market_startdate,
                    market_enddate : item.market_enddate
                });
                cb(null, null);
            }, function(err) {
                if(err) {
                    return callback(null);
                }
            });
            callback(null, list);
        });
    });
}

//내가 좋아요한마켓보기
function goodList(info, callback) {
    var sql_select_main = "SELECT mhu.good_idx, m.market_idx, m.market_address, m.market_name, i.image_url, m.market_count, u.user_nickname, "+
                        "date_format(convert_tz(m.market_startdate, '+00:00', '+00:00'), '%Y-%m-%d') market_startdate, "+
                        "date_format(convert_tz(m.market_enddate, '+00:00', '+00:00'), '%Y-%m-%d') market_endtdate, "+
                        "TO_DAYS(m.market_enddate)-TO_DAYS(NOW()) market_state "+
                        "FROM Market_has_User mhu JOIN Market m ON (mhu.market_idx = m.market_idx) "+
                        "JOIN Image i ON (mhu.market_idx = i.market_idx) "+
                        "JOIN User u ON (u.user_idx = m.user_idx) "+
                        "WHERE mhu.user_idx = ? AND i.image_type = 1 ORDER BY market_idx DESC LIMIT ?, 10 ";
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        var list = [];
        dbConn.query( sql_select_main, [info.user_idx, info.currentPage], function(err, result) {
            dbConn.release();
            if(err) {
                return callback(err);
            }
            async.each(result, function(item, cb) {
                list.push({
                    user_nickname : item.user_nickname,
                    idx : item.market_idx,
                    address : item.market_address,
                    state : item.market_state,
                    image : "http://localhost:3000/images/"+item.image_url,
                    marketname : item.market_name,
                    market_state : item.market_state,
                    market_count : item.market_count,
                    market_startdate : item.market_startdate,
                    market_enddate : item.market_enddate,
                    favorite : 1
                });
                cb(null, null);
            }, function(err) {
                if(err) {
                    return callback(null);
                }
            });
            callback(null, list);
        });
    });
}


module.exports.nickname = nickname;
module.exports.nicknameCheck = nicknameCheck;
module.exports.marketUploads = marketUploads;
module.exports.marketEnrollment = marketEnrollment;
module.exports.goodList = goodList;