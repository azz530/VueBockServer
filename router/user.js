const express = require('express');
const router = express.Router();
const user = require('../router_handle/user');

router.post('/login',user.login)

module.exports = router