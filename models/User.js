const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const sano =10;

const transactSchema = mongoose.Schema({
    type: {
        type: String,
        default: "Miscellaneous",
        required: true,
    },
    cost: Number,
    date: Date,
});

const gauthtokenSchema = mongoose.Schema({
    access_token : {
        type: String,
    },
    refresh_token : {
        type: String,
    },
    scope: {
        type: String, 
    },
    token_type: {
        type: String,
    }
})

const userSchema = mongoose.Schema({
    firstname: {
        type: String,
        required: [true, "Provide a username"],
    },
    lastname: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,

    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    expenditure: [transactSchema],
    earning: [transactSchema],
    gauthtoken: gauthtokenSchema,
});


userSchema.pre("save", async function (next) {
    if (!this.isModified("password")){
        next();
    }
    const salt= await bcrypt.genSalt(sano);
    this.password = await bcrypt.hash(this.password,salt);
    next();
});

userSchema.methods.matchPassword = async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.getSignedToken = async function (){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{});
}

userSchema.methods.getResetPasswordToken = function(){
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpire = Date.now()+ 10*(60*1000);
    return resetToken;
}

const User = mongoose.model("User", userSchema);

module.exports = User;