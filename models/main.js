var dbPool = require('../models/common').dbPool;
var async = require('async');


//FIXME : 좋아요정보수정해야함!
function list(currentPage, callback) {
    var sql_select_main = "SELECT M.market_idx, M.market_address , M.market_state, M.market_name, "+
                          "M.market_good, I.image_url, I.image_type " +
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
                    count : item.market_good,
                    good : '0'
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
function search(info, callback) {
    
}

module.exports.list = list;
module.exports.search = search;