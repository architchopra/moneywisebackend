const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const {google} = require('googleapis');
const { Mongoose } = require('mongoose');
const {OAuth2Client} = require('google-auth-library');
const axios = require('axios');
const jwt = require('jsonwebtoken');

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

exports.googlesignin = async(req,res,next)=>{
    const config ={
        headers:{
          'Content-Type': 'application/json',
        }
    }
    try {
        //console.log(req.body.code);
        const body={
            code:req.body.code,
            client_id:process.env.client_id,
            client_secret:process.env.client_secret,
            redirect_uri:"postmessage",
            grant_type:"authorization_code"
        }
        const {data} =await axios.post('https://oauth2.googleapis.com/token',body,config);
        //console.log(data);
        const info = jwt.decode(data.id_token);
        const user = await User.findOne({email:info.email});
        if(!user){
            const user = await User.create({
                firstname:info.given_name,
                lastname:info.family_name,
                email:info.email,
                password:info.email+process.env.JWT_SECRET,
                gauthtoken:data,
            });
            sendToken(user,201,res);
        }
        else if(data.refresh_token){
            user.gauthtoken=data;
            user.save();
            sendToken(user,200,res);
        }
        else if(!info.email_verified){
            next(new ErrorResponse("Email not verified",401));
        }
        else{
            sendToken(user,200,res);
        }
    } catch (error) {
        console.log(error);
    }
}

exports.gauthcallback = async (req,res,next)=>{
    try {
        const gauthcallback =`http://localhost:5000/api/auth/gauth/${req.params.id}/callback`;
        const oauth2Client = new google.auth.OAuth2(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            'postmessage'
        );

        const {code} = req.query;
        console.log(req.query);
        console.log(req.params);

        const {tokens} = await oauth2Client.getToken(code);
        console.log(tokens);

        const user = await User.findById(req.params.id);
        user.gauthtoken=tokens;
        await user.save();

        oauth2Client.setCredentials(tokens);
        const gmail = google.gmail({version: 'v1', oAuth2Client});
        gmail.users.labels.list({
            userId: 'me',
            }, (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
            const labels = res.data.labels;
            if (labels.length) {
                console.log('Labels:');
                labels.forEach((label) => {
                    console.log(`- ${label.name}`);
                });
            } else {
                console.log('No labels found.');
            }
        });
    } catch (error) {
        
    }
}
