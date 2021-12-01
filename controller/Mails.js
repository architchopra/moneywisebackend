const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const {google} = require('googleapis');
const {OAuth2Client} = require('google-auth-library');
const axios = require('axios');
const getAccessToken= require('../utils/getAccessToken');

exports.getmail = async(req,res,next)=>{
    try {
        const user = await User.findById(req.user._id);
        if(user.gauthtoken.access_token==null){
            res.status(404).json({"message":"Not linked with Gmail"});
            return;
        }
        const access_token=await getAccessToken(req.user._id);
        const oauth2Client = new google.auth.OAuth2(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            'postmessage'
        );
        oauth2Client.setCredentials(access_token);
        const gmail = await google.gmail({version: 'v1',auth: oauth2Client});
        let val=await gmail.users.messages.list({userId: 'me'});
        val=val.data.messages;
        let messages=[];
        for(let i=0;i<val.length;i++){
            let curmessage=await gmail.users.messages.get({userId:'me',id:val[i].id});
            messages.push(curmessage.data.payload.parts);
        }
        res.status(200).json({messages});
    } catch (error) {
        next(error);
    }
}