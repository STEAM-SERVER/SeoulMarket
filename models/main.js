var dbPool = require('../models/common').dbPool;
var async = require('async');


//FIXME : 중복제거필요
function list(currentPage, callback) {
    var sql_select_main = "SELECT M.market_idx, M.market_address , M.market_state, M.market_name, "+
                          "M.market_count, I.image_url " +
                          "FROM Market M LEFT JOIN Image I ON (M.market_idx = I.market_idx) LIMIT ?, 10 ";

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
                    image : item.image_url && ('http://localhost:3000/image/'+item.image_url),
                    marketname : item.market_name,
                    count : item.market_count,
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

module.exports.list = list;