const db = require('../db');
const bcryptjs = require('bcryptjs');//密码加密
const jwt = require('jsonwebtoken');
const config = require('../config.js');
//用户注册
exports.register = (req, res) => {
    const userInfo = {
        username: req.body.username,
        password: req.body.password,
        register_time: new Date(),
    }
    const sql = 'select username from user where username = ?';
    const sql1 = 'insert into user set ?';
    db.query(sql, userInfo.username, (err, result) => {
        if (err) {
            return res.cc(err.message);
        } else if (result.length === 1) {
            return res.cc('该用户名已存在', 403);
        } else {
            userInfo.password = bcryptjs.hashSync(userInfo.password, 10);
            db.query(sql1, userInfo, (error, results) => {
                if (error) {
                    return res.cc(error.message);
                } else if (results.affectedRows !== 1) {
                    return res.cc('注册失败', 400);
                } else {
                    return res.cc('注册成功', 200);
                }
            })
        }
    })
}
//用户登录
exports.login = (req, res) => {
    const userInfo = req.body;
    const sql = 'select username,password from user where username =?';
    const sql1 = 'update user set isLogin = 1 where username = ?'
    db.query(sql,userInfo.username,(err,results)=>{
        if(err){
            return res.cc(err.message);
        } else if(results.length !== 1){
            return res.cc('该用户不存在',400);
        } else {
            const rightPsw = bcryptjs.compareSync(userInfo.password,results[0].password);
            if(!rightPsw){
                return res.cc('密码错误',401);
            }else {
                db.query(sql1,userInfo.username,(error,result)=>{
                    if(error){
                        return res.cc('修改用户登录状态失败',400);
                    } else if(result.affectedRows !== 1){
                        return res.cc('修改用户登录状态失败',400);
                    } else {
                        const user = {...results[0],password:''};
                        const token = jwt.sign(user,config.jwtSecretKey,{expiresIn:config.expiresIn});
                        return res.send({
                            status:200,
                            message:'登录成功',
                            token: 'Bearer ' + token,
                        })
                    }
                })
            }
        }
    })
}