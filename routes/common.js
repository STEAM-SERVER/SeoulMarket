// 로그인이 안되어 있으면 돌려보내는 함수
function isAuthenticated(req, res, next) {
    if (!req.user) {
        return res.status(401).send({
            message: 'login required'
        });
    }
    next();
}

// https로 요청이 아니면 돌려보내는 함수
function isSecure(req, res, next) {
    if (!req.secure) {
        return res.status(426).send({
            message: 'Not HTTPS'
        });
    }
    next();
}


module.exports.isAuthenticated = isAuthenticated;
module.exports.isSecure = isSecure;

//사용법
/*
 router.get('/', isAuthenticated, isSecure,function(req, res, next) {
    .....코드
 });
 */