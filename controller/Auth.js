const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

exports.register = async (req,res,next) =>{
    const {firstname,lastname,email,password}= req.body;
    try {
        const user = await User.create({
            firstname:firstname,
            lastname:lastname,
            email:email,
            password:password,
        });
        sendToken(user,201,res);
    }
    catch(error){
        next(error);
    }
};

exports.login = async (req,res,next) =>{
    const {email,password} = req.body;
    if(!email||!password){
        next(new ErrorResponse("No credentials",400));
    }
    try{
        const user = await User.findOne({email}).select("+password");
        if(!user){
            next(new ErrorResponse("No user with the email",401));
        }
        else{
            const isMatch = await user.matchPassword(password);
            if(isMatch){
                sendToken(user,200,res);
            }
            else{
                next(new ErrorResponse("Wrong Password",401));
            }
        }
    }
    catch(error){
        next(error);
    }
};

exports.forgotpassword = async(req,res,next) =>{
    const {email}= req.body;
    try {
        const user = await User.findOne({email});
        if(!user){
            return next(new ErrorResponse("no user with email",404))
        }
        const resetToken  = user.getResetPasswordToken();
        await user.save();
        const resetUrl = `${process.env.CLIENT_URL}/passwordreset/${resetToken}`;
        const message= `<h1>you have requested to reset password<a href='${resetUrl}'clicktracking=off>${resetUrl}</a>`

        try {
            await sendEmail({
                to: user.email,
                subject: "shoppers Password reset",
                text: message,

            });

            res.status(200).json({
                success: true,
                data: "Email Sent",

            });

        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return next(new ErrorResponse('Failed to send reset mail',500));
        }

    } catch (error) {
        next(error);
    }
}

exports.resetpassword = async (req,res,next) =>{
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.resetToken).digest("hex");

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return next(new ErrorResponse("Invalid Token", 400));
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(201).json({
            success: true,
            data: "Password Updated Success",
            token: user.getSignedJwtToken(),
        });
    } 
    catch (err) {
        next(err);
    }
}

const sendToken = async (user,statusCode,res) => {
    const token = await user.getSignedToken();
    res.status(statusCode).json({
        success:"true",
        token ,
        firstname :user.firstname,
        lastname: user.lastname,
        email:user.email,
    });
}