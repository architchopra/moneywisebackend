const express = require('express');
const router = express.Router();
const {addexpense,findexpense} = require('../controller/expenditure');
const {protect} = require('../middleware/auth');

router.post('/expenses/add',protect,addexpense);
router.post('/expenses',protect,findexpense);

module.exports= router;
