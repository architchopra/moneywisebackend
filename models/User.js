const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const sano =10;

const cartitemschema = mongoose.Schema({
    item: mongoose.ObjectId,
    qty: Number,
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
    cart : [cartitemschema],
});

userSchema.methods.updatecart = async function(id,qty){
    if(qty==0){
        this.cart.pull({_id:id});
        await this.save();
    }
    else{
        var doc = this.cart.id(id);
        this.cart.pull({_id:id});
        this.cart.push({_id:id,item:doc.item,qty:qty});
        await this.save();
    }
}

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
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{expiresIn: process.env.JWT_EXPIRE});
}

userSchema.methods.getResetPasswordToken = function(){
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpire = Date.now()+ 10*(60*1000);
    return resetToken;
}

const User = mongoose.model("User", userSchema);

module.exports = User;