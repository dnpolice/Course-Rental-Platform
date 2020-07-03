
module.exports = function(req, res, next){
    //401 isUnauthorized (invalid webtoken)
    //403 isForbidden
    if(!req.user.isAdmin) return res.status(403).send('Access denied.');

    next();
}