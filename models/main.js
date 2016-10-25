var dbPool = require('../models/common').dbPool;
var async = require('async');


//마켓메인리스트보기
function list(currentPage, callback) {
    var sql_select_main = "SELECT M.market_idx, M.market_address,  M.market_name, "+
                          "I.image_url, I.image_type, TO_DAYS(M.market_enddate)-TO_DAYS(NOW()) market_state " +
                          "FROM Market M LEFT JOIN Image I ON (M.market_idx = I.market_idx) " +
                          "WHERE I.image_type = 1 LIMIT ?, 10 ";

    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        var list = [];
        dbConn.query( sql_select_main, [currentPage], function(err, result) {
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

// 위치, 날짜검색
//FIXME : 수정해야함(쿼리)
function search(search, callback){

    var where_sql = '';
    // var sql_parameter = [];

    // 주소 특정검색 -> 날짜 전체
    if (search.address != '*'){
        where_sql = where_sql +`WHERE m.market_address REGEXP '${search.address}' `;
        // sql_parameter.push(search.address);
    }

    if (search.startdate != '*'){
        if (search.enddate != '*'){
            where_sql = where_sql +`AND (m.market_startdate ='${search.startdate}' and m.market_enddate ='${search.enddate}') `;
            // sql_parameter.push(search.startdate);
            // sql_parameter.push(search.enddate);
        }
        else{
            where_sql = where_sql +`AND (m.market_startdate ='${search.startdate}') `;
            // sql_parameter.push(search.startdate);
        }
    }

    // var where_sql =  "WHERE m.market_address REGEXP '" + search.address + "' ";
    // where_sql = `WHERE m.market_address REGEXP '${search.address}'`;
    var state_sql = 'TO_DAYS(m.market_enddate)-TO_DAYS(NOW()) market_state, ';

    var sql = 'SELECT m.market_idx, m.market_address, '
        + state_sql
        + 'm.market_name, i.image_url, m.market_count, '
        + 'date_format(convert_tz(m.market_startdate, "+00:00", "+00:00"), "%Y-%m-%d %H:%i:%s") market_startdate, '
        + 'date_format(convert_tz(m.market_enddate, "+00:00", "+00:00"), "%Y-%m-%d %H:%i:%s") market_enddate '
        + 'FROM Market m '
        + 'LEFT JOIN Image i ON m.market_idx = i.image_idx '
        + where_sql
        + 'LIMIT ?, 10 ';

    dbPool.getConnection(function(err, dbConn) {
        if(err) {
            return callback(err);
        }
        dbConn.query(sql, [search.currentPage], function (error, result) {
            dbConn.release();
            if(error) {
                return callback(error);
            }
            callback(null, result);
        });
    });
}

//이름검색
//FIXME : 수정해야함(쿼리)
function searchName(search, callback){

    var where_sql = `WHERE m.market_name REGEXP '${search.name}'`;
    var state_sql = 'TO_DAYS(m.market_enddate)-TO_DAYS(NOW()) market_state, ';

    var sql = 'SELECT m.market_idx, m.market_address, '
        + state_sql
        + 'm.market_name, i.image_url, m.market_count, m.market_startdate, m.market_enddate '
        + 'FROM Market m '
        + 'LEFT JOIN Image i ON m.market_idx = i.image_idx '
        + where_sql
        + 'LIMIT ?, 10 ';

    dbPool.getConnection(function(err, dbConn) {
        dbConn.release();
        if(err) {
            return callback(err);
        }
        dbConn.query(sql, [search.currentPage], function (error, result) {
            if(error) {
                return callback(error);
            }
            callback(null, result);
        });
    });
}


//상세정보
function market_detail(info, callback) {
    var sql_select_market_detail = "SELECT m.market_idx, u.user_nickname, m.market_host, m.market_address, m.market_tag, "+
                                    "TO_DAYS(m.market_enddate)-TO_DAYS(NOW()) market_state,"+
                                    "X(market_point) market_latitude, Y(market_point) market_longitude, "+
                                    "m.market_name, m.market_url, m.market_count, " +
                                    "date_format(convert_tz(m.market_startdate, '+00:00', '+00:00'), '%H:%i:%s') market_openTime, "+
                                    "date_format(convert_tz(m.market_enddate, '+00:00', '+00:00'), '%H:%i:%s') market_endTime, "+
                                    "date_format(convert_tz(m.market_startdate, '+00:00', '+00:00'), '%Y-%m-%d') market_startdate, " +
                                    "date_format(convert_tz(m.market_enddate, '+00:00', '+00:00'), '%Y-%m-%d') market_enddate, " +
                                    "m.market_contents, good.good_idx 'favorite'"+
                                    "FROM Market m JOIN User u ON(u.user_idx = m.user_idx) "+
                                    "LEFT JOIN (SELECT mhu.good_idx, mhu.market_idx, mhu.user_idx FROM Market_has_User mhu WHERE mhu.user_idx=?) good ON(good.market_idx = m.market_idx) "+
                                    "WHERE m.market_idx=?";
    var sql_select_img = "SELECT image_url, image_type FROM Image i WHERE market_idx = ?";
    var sql_select_review = "SELECT r.review_idx, r.review_contents, r.review_img, u.user_nickname, " +
                            "date_format(convert_tz(r.review_uploadtime, '+00:00', '+00:00'), '%Y-%m-%d %H:%i:%s') review_uploadtime "+
                            "FROM Review r JOIN User u ON(r.user_idx = u.user_idx) "+
                            "WHERE r.market_idx = ?";
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        var market;
        var image = [];
        var review = [];
        async.series([market_detail, market_img, market_review], function(err, results) {
            if(err) {
                dbConn.release();
                return callback(err);
            }
            dbConn.release();
            callback(null, market, image, review);
        });

        function market_detail(callback){
            dbConn.query(sql_select_market_detail, [info.user_id, info.market_id], function(err, result) {
                if(err) {
                    return callback(err);
                }
                market = result[0];
                callback(null, null);
            });
        }
        function market_img(callback){
            dbConn.query(sql_select_img, [info.market_id], function(err, result) {
                if(err) {
                    return callback(err);
                }
                async.each(result, function(item, done) {
                    image.push({
                        img_url : 'http://localhost:3000/images/'+item.image_url
                    });
                    done(null, null);
                }, function(err) {
                    if (err) {
                        return callback(err);
                    }
                });
                callback(null, result);
            });
        }

        function market_review(callback){
            dbConn.query(sql_select_review, [info.market_id], function(err, result) {
                if(err) {
                    return callback(err);
                }
                async.each(result, function(item, done) {
                    review.push({
                        review_idx : item.review_idx,
                        user_nickname : item.user_nickname,
                        review_contents :item.review_contents,
                        review_img : item.review_img,
                        review_uploadtime : item.review_uploadtime
                    });
                    done(null, null);
                }, function(err) {
                    if (err) {
                        return callback(err);
                    }
                });
                callback(null, result);
            });
        }
    });
}

//좋아요
function good(info, callback) {
    var sql_update_marketCount = "UPDATE Market SET market_count = market_count+1 WHERE market_idx = ? ";
    var sql_insert_marketHasUser = "INSERT INTO Market_has_User(market_idx, user_idx) VALUES(?, ?);";
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.beginTransaction(function(err) {
            if (err) {
                return callback(err);
            }
            async.series([update_marketCount, insert_marketHasUser], function(err, results) {
                if (err) {
                    return dbConn.rollback(function() {
                        dbConn.release();
                        callback(err);
                    });
                }
                dbConn.commit(function() {
                    dbConn.release();
                    callback(null, results);
                });
            });

            function update_marketCount(callback) {
                dbConn.query(sql_update_marketCount, [info.market_idx], function(err, result) {
                    if (err) {
                        return callback(err);
                    }
                    callback(null, null);
                });
            }
            function insert_marketHasUser(callback) {
                dbConn.query(sql_insert_marketHasUser, [info.market_idx, info.user_idx], function(err, result) {
                    if (err) {
                        return callback(err);
                    }
                    callback(null, null);
                });
            }
        });
    });
}


//좋아요취소
function goodCancel(info, callback) {
    var sql_update_marketCount = "UPDATE Market SET market_count = market_count-1 WHERE market_idx = ? ";
    var sql_delete_marketHasUser = "DELETE FROM Market_has_User WHERE market_idx = ? AND user_idx = ?";
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.beginTransaction(function(err) {
            if (err) {
                return callback(err);
            }
            async.series([update_marketCount, delete_marketHasUser], function(err, results) {
                if (err) {
                    return dbConn.rollback(function() {
                        dbConn.release();
                        callback(err);
                    });
                }
                dbConn.commit(function() {
                    dbConn.release();
                    callback(null, results);
                });
            });

            function update_marketCount(callback) {
                dbConn.query(sql_update_marketCount, [info.market_idx], function(err, result) {
                    if (err) {
                        return callback(err);
                    }
                    callback(null, null);
                });
            }
            function delete_marketHasUser(callback) {
                dbConn.query(sql_delete_marketHasUser, [info.market_idx, info.user_idx], function(err, result) {
                    if (err) {
                        return callback(err);
                    }
                    callback(null, null);
                });
            }
        });
    });
}


module.exports.list = list;
module.exports.search = search;
module.exports.market_detail = market_detail;
module.exports.searchName = searchName;
module.exports.good = good;
module.exports.goodCancel = goodCancel;