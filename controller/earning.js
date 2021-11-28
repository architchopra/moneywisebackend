const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

exports.addearning= async(req,res,next)=>{
    try {
        const {type,cost,date}=req.body;
        const user = await User.findById(req.user._id);
        user.earning.push({type:type,cost:cost,date:date});
        await user.save();
        res.status(201).json({
            success:true,
            data:"transaction added to earning",
        });
    } catch (error) {
        next(error);
    }
}

exports.findearning = async(req,res,next)=>{
    try {
        const user= await User.findById(req.user._id);
        res.status(200).json({
            earning:user.earning
        })
    } catch (error) {
        
    }
}