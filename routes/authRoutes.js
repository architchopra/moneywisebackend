const express = require('express');
const router = express.Router();
const {register,login,resetpassword,forgotpassword,googlesignin,gauthcallback}=require('../controller/Auth'); 

router.post("/register",register);
router.post("/login",login);
router.post("/forgotpassword",forgotpassword);
router.put("/resetpassword/:resetToken",resetpassword);
router.post("/gauth",googlesignin);
router.get("/gauth/:id/callback",gauthcallback)

module.exports = router;