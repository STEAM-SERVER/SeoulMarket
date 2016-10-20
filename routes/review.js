var dbPoolConfig = require('../config/config').dbPoolConfig;
var dbPool = mysql.createPool(dbPoolConfig);

var router = express.Router();


router.post('/',function (req,res) {

    var sql = 'INSERT INTO Review(review_contents, review_img, market_idx, user_idx) Values(?,?,?,?)';
    dbPool.query(sql,[req.body.review_contents,
        req.body.review_img,
        req.body.market_idx,
        req.body.user_idx],
        function (error, cursor) {
            if (error!=undefined) {
                res.json({
                    "message": "DB Error!"
                })
            }else{
                res.json({
                    "result":
                    {
                        message : "Success"
                    }

                })
            }
    });
});
module.exports = router;
