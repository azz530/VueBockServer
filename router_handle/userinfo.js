const db = require('../db');
const config = require('../config');

exports.logout = (req, res) => {
    const user_id = parseInt(req.body.user_id);
    const sql = 'update user set isLogin = 0 where user_id = ?';
    db.query(sql, user_id, (err, result) => {
        if (err) {
            return res.cc(err.message);
        } else if (result.affectedRows !== 1) {
            return res.cc('退出登录失败', 401);
        } else {
            return res.cc('退出登录成功', 200);
        }
    })
}

exports.getUserInfo = (req, res) => {
    const user_id = parseInt(req.query.user_id);
    const sql = 'select * from user where user_id = ?';
    db.query(sql, user_id, (err, result) => {
        if (err) {
            return res.cc(err.message);
        } else if (result.length !== 1) {
            return res.cc('获取用户信息失败', 400);
        } else {
            delete result[0].password;
            result = JSON.parse(JSON.stringify(result));
            return res.send({
                status: 200,
                message: '获取用户信息成功',
                data: result[0]
            })
        }
    })
}

exports.editorUserInfo = (req, res) => {
    let avatarUrl = '';
    let userInfo = {};
    if (req.files[0]) {
        avatarUrl = config.baseUrl + req.files[0].filename;
        userInfo = {
            user_id: req.body.user_id,
            username: req.body.username,
            sex: req.body.sex,
            usersign: req.body.usersign,
            hobby: req.body.hobby,
            email: req.body.email,
            birthday: req.body.birthday,
            address: req.body.address,
            avatar: avatarUrl,
        };
    } else {
        userInfo = {
            user_id: req.body.user_id,
            username: req.body.username,
            sex: req.body.sex,
            usersign: req.body.usersign,
            hobby: req.body.hobby,
            email: req.body.email,
            birthday: req.body.birthday,
            address: req.body.address,
        };
    }
    const sql = 'update user set ? where user_id = ?';
    db.query(sql, [userInfo, userInfo.user_id], (err, result) => {
        if (err) {
            return res.cc(err.message);
        } else if (result.affectedRows !== 1) {
            return res.cc('修改用户信息失败', 400);
        } else {
            return res.send({
                status: 200,
                message: '修改用户信息成功',
                userInfo,
            })
        }
    })
}

exports.getMyArticle = (req, res) => {
    const user_id = parseInt(req.query.user_id);
    let pageNum = parseInt(req.query.pageNum) - 1;
    let pageSize = parseInt(req.query.pageSize);
    const sql = 'select * from article where user_id = ? order by article_time desc limit ?,?';
    const sql1 = 'select count(*) as total from article where user_id =?';
    db.query(sql, [user_id,pageNum * pageSize, pageSize], (err, result) => {
        if (err) {
            return res.cc(err.message);
        } else if (result.length <= 0) {
            return res.cc('未查到该用户的文章信息', 400);
        } else {
            result = JSON.parse(JSON.stringify(result));
            db.query(sql1, user_id, (err1, total) => {
                if (err1) {
                    return res.cc(err1.message);
                } else {
                    return res.send({
                        status: 200,
                        message: '查询成功',
                        data: result,
                        total:total[0]['total']
                    })
                }
            })

        }
    })
}

exports.addArticle = (req, res) => {
    const articleInfo = req.body;
    articleInfo.article_time = new Date();
    const sql = 'insert into article set ?';
    db.query(sql, articleInfo, (err, result) => {
        if (err) {
            return res.cc(err.message);
        } else if (result.affectedRows !== 1) {
            return res.cc('新增文章失败', 400);
        } else {
            return res.cc('新增文章成功', 200);
        }
    })
}