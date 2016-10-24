var dbPool = require('../models/common').dbPool;
var async = require('async');


//FIXME : 좋아요정보수정해야함!
function list(currentPage, callback) {
    var sql_select_main = "SELECT M.market_idx, M.market_address,  M.market_name, "+
                          "I.image_url, I.image_type " +
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
                    image : "http://192.168.10.21:3000/images/"+item.image_url,
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

//FIXME : 위치검색함수 수정사항

// searchAddress, searchDate 삭제예정
// function searchAddress(info, callback) {
//
//     var where_sql = `WHERE m.market_address REGEXP '${search.address}'`;
//
//     // var state_sql = 'TO_DAYS(m.market_enddate)-TO_DAYS(NOW()) market_state, ';
//
//     // search.enddate에 market_enddate가 담겨있나?
//     var state_sql = `TO_DAYS('${search.enddate}') - TO_DAYS(NOW()) market_state ` ;
//     var sql = 'SELECT m.market_idx, m.market_address, '
//         + state_sql
//         + 'm.market_name,m.market_count, m.market_startdate, m.market_enddate, i.image_url '
//         + 'FROM Market m '
//         + 'LEFT JOIN Image i ON m.market_idx = i.image_idx '
//         + where_sql
//         + 'LIMIT ?, 10 ';
//
//     dbPool.getConnection(function(err, dbConn) {
//         dbConn.release();
//         if(err) {
//             return callback(err);
//         }
//         dbConn.query(sql, [currentPage], function (error, result) {
//             if(error) {
//                 return callback(error);
//             }
//             callback(null, result);
//         });
//     });
// }
//
// function searchDate(search, callback) {
//
//     var where_sql =  "WHERE m.market_address REGEXP '" + search.address + "' ";
//     var state_sql = 'TO_DAYS(m.market_enddate)-TO_DAYS(NOW()) market_state ';
//
//     var sql = 'SELECT m.market_idx, m.market_address, '
//         + state_sql
//         + 'm.market_name,m.market_count, m.market_startdate, m.market_enddate, i.image_url '
//         + 'FROM Market m '
//         + 'LEFT JOIN Image i ON m.market_idx = i.image_idx '
//         + where_sql
//         + 'LIMIT ?, 10 ';
//
//     dbPool.getConnection(function(err, dbConn) {
//         dbConn.release();
//         if(err) {
//             return callback(err);
//         }
//         dbConn.query(sql, [currentPage], function (error, result) {
//             if(error) {
//                 return callback(error);
//             }
//             callback(null, result);
//         });
//     });
// }

// 위치, 날짜검색
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
//이름검색
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




function market_detail(info, callback) {
    var sql_select_market_detail = "SELECT m.market_idx, u.user_nickname, m.market_host, m.market_address, "+
                                    "TO_DAYS(m.market_enddate)-TO_DAYS(NOW()) market_state,"+
                                    "X(market_point) market_latitude, Y(market_point) market_longitude, "+
                                    "m.market_name, m.market_url, m.market_count, m.market_startdate, m.market_enddate, m.market_contents, good.good_idx 'favorite'"+
                                    "FROM Market m JOIN User u ON(u.user_idx = m.user_idx) "+
                                    "LEFT JOIN (SELECT mhu.good_idx, mhu.market_idx, mhu.user_idx FROM Market_has_User mhu WHERE mhu.user_idx=?) good ON(good.market_idx = m.market_idx) "+
                                    "WHERE m.market_idx=?";
    var sql_select_img = "SELECT image_url, image_type FROM Image i WHERE market_idx = ?";
    var sql_select_review = "SELECT r.review_idx, r.review_contents, r.review_uploadtime, r.review_img, u.user_nickname "+
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
                        img_url : item.image_url
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


// 마켓 후기
function write(review, callback) {
    var sql = 'INSERT INTO Review(review_contents, review_img, market_idx, user_idx) Values(?,?,?,?)';
    dbPool.getConnection(function(err, dbConn) {
        dbConn.release();
        if(err) {
            return callback(err);
        }
        dbConn.query(sql, [review.contents, review.img, review.market_idx, review.user_idx], function (error, result) {
            if(error) {
                return callback(error);
            }
            callback(null, result);
        });
    });
}

module.exports.list = list;
// module.exports.searchAddress = searchAddress;
// module.exports.searchDate= searchDate;
module.exports.searchName = searchName;
module.exports.search = search;
module.exports.market_detail = market_detail;
module.exports.write = write;
