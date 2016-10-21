
var dbPool = require('../models/common').dbPool;

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

module.exports.write = write;