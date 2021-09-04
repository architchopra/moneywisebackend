const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse= require('../utils/errorResponse');

exports.protect = async (req,res,next)=>{
    let {token}= req.headers;
    if(!token){
        return next(new ErrorResponse("Not authorized to access",401));
    }

    try {
        const decoded = await jwt.verify(token,process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if(!user){
            return next(new ErrorResponse("No user with id",404));
        }
        req.user = user;
        next();

    } catch (error) {
        return next(new ErrorResponse("Token expired",401));
    }
}