const express = require('express');
const router = express.Router();
const {addexpense,findexpense} = require('../controller/expenditure');
const {addearning,findearning} = require('../controller/earning');
const {protect} = require('../middleware/auth');
const {getmail} = require('../controller/Mails');

router.post('/expenses/add',protect,addexpense);
router.post('/expenses',protect,findexpense);
router.post('/earning/add',protect,addearning);
router.post('/earning',protect,findearning);
router.post('/mails',protect,getmail);

module.exports= router;
