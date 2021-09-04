const express = require('express');
const router = express.Router();
const {register,login,resetpassword,forgotpassword}=require('../controller/Auth'); 

router.post("/register",register);
router.post("/login",login);
router.post("/forgotpassword",forgotpassword);
router.put("/resetpassword/:resetToken",resetpassword);

module.exports = router;