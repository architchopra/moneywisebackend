const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

exports.addexpense= async(req,res,next)=>{
    try {
        const {type,cost,date}=req.body;
        const user = await User.findById(req.user._id);
        user.expenditure.push({type:type,cost:cost,date:date});
        await user.save();
        res.status(201).json({
            success:true,
            data:"transaction added to expenditure",
        });
    } catch (error) {
        next(error);
    }
}

exports.findexpense = async(req,res,next)=>{
    try {
        const user= await User.findById(req.user._id);
        let expenses=user.expenditure;
        expenses.sort((a,b)=>{
            return b.date-a.date;
        });
        res.status(200).json({
            expenses:expenses
        })
    } catch (error) {
        console.log(error);
    }
}