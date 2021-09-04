const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req,res,next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    req.isAuth = false;
    next();
  }
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token,process.env.SECRET)
    } catch (err) {
        err.statuseCode = 500;
        throw err;
    }

    if (!decodedToken){
        const error = new Error('Empty token');
        error.statuseCode = 401;
        throw error;
    }

    req.userId = decodedToken.userId;
    req.isAuth = true;
    next();
}
