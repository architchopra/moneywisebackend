const express = require('express');
const router = express.Router();
const {addexpense,findexpense} = require('../controller/expenditure');
const {protect} = require('../middleware/auth');
const {getmail} = require('../controller/Mails');

router.post('/expenses/add',protect,addexpense);
router.post('/expenses',protect,findexpense);
router.post('/mails',protect,getmail);

module.exports= router;
