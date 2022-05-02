const db  = require('../db');
const bcryptjs = require('bcryptjs');//密码加密
const jwt = require('jsonwebtoken');
const config = require('../config.js');

exports.login = (req,res) =>{
    const userInfo = {
        username:req.body.username,
        password:req.body.password
    }
    const sql = 'select username from user where username = ?';
    
}