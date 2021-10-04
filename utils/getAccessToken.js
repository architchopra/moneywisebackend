const User = require('../models/User');
const axios = require('axios');

const getAccessToken = async(id)=>{    
    const config ={
        headers:{
          'Content-Type': 'application/json',
        }
    }
    try {
        //console.log(req.body.code);
        const user = await User.findById(id);
        const body={
            client_id:process.env.client_id,
            client_secret:process.env.client_secret,
            refresh_token:user.gauthtoken.refresh_token,
            grant_type:"refresh_token"
        }
        const {data} =await axios.post('https://oauth2.googleapis.com/token',body,config);
        return data;
    } catch (error) {
        
    }
}

module.exports = getAccessToken;
