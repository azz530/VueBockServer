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
    db.query(sql, [user_id, pageNum * pageSize, pageSize], (err, result) => {
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
                        total: total[0]['total']
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

exports.getAllArticle = (req, res) => {
    let pageNum = parseInt(req.query.pageNum) - 1;
    let pageSize = parseInt(req.query.pageSize);
    const user_id = parseInt(req.query.user_id);
    const sortType = req.query.sortType;
    const sql = sortType === 'time' ?   //按时间排序还是按收藏数排序
    'select t1.article_id,t1.article_title,t1.article_tags,t1.article_time, count(t2.user_id) as collection_num from article t1 left join usercollection t2 on t1.article_id = t2.article_id group by t1.article_id order by t1.article_time desc limit ?,?':
    'select t1.article_id,t1.article_title,t1.article_tags,t1.article_time, count(t2.user_id) as collection_num from article t1 left join usercollection t2 on t1.article_id = t2.article_id group by t1.article_id order by collection_num desc limit ?,?';
    const sql1 = 'select count(*) as total from article';
    const sql2 = 'select *from usercollection where user_id =?';
    db.query(sql, [pageNum * pageSize, pageSize], (err, result) => {//查询所有文章及收藏人数
        if (err) {
            return res.cc(err.message);
        } else if (result.length <= 0) {
            return res.cc('为查询到数据', 400);
        } else {
            result = JSON.parse(JSON.stringify(result));
            db.query(sql1, (err1, total) => {//文章总数
                if (err1) {
                    return res.cc(err1.message);
                } else {
                    db.query(sql2, user_id, (err2, result2) => {//通过用户id查询收藏的文章
                        if (err2) {
                            return res.cc(err2.message);
                        } else {
                            result2 = JSON.parse(JSON.stringify(result2));
                            let IdArr = [];
                            result2.forEach(item => {
                                IdArr.push(item.article_id);//把用户收藏的文章id放入数组
                            })
                            result.map(item => {//遍历所有文章数组，判断用户收藏的文章，有则该文章状态为已收藏。
                                if (IdArr.includes(item.article_id)) {
                                    item.isCollection = true;
                                } else {
                                    item.isCollection = false;
                                }
                            })
                            return res.send({
                                status: 200,
                                message: '查询成功',
                                data: result,
                                total: total[0]['total'],
                            })
                        }
                    })
                }
            })
        }
    })

}

exports.addCollection = (req, res) => {
    const Info = {
        user_id: req.body.user_id,
        article_id: req.body.article_id,
        time: new Date(),
    }
    const sql = 'insert into usercollection set ?';
    db.query(sql, Info, (err, result) => {
        if (err) {
            return res.cc(err.message);
        } else if (result.affectedRows !== 1) {
            return res.cc('收藏失败', 400);
        } else {
            return res.cc('收藏成功', 200);
        }
    })

}

exports.delCollection = (req,res) =>{
    const article_id = req.body.article_id;
    const user_id = req.body.user_id;
    const sql = 'delete from usercollection where article_id=? and user_id=?';
    db.query(sql,[article_id,user_id],(err,result)=>{
        if(err){
            return res.cc(err.message);
        } else if(result.affectedRows !==1){
            return res.cc('取消收藏失败',400);
        } else {
            return res.cc('取消收藏成功',200);
        }
    })
}

exports.getArticleDetails = (req,res) =>{
    const article_id = req.query.article_id;
    const user_id = parseInt(req.query.user_id);
    const sql = 'select t1.article_id,t1.article_title,t1.article_tags,t1.article_time,t1.article_content,t2.username,t2.avatar from article t1 left join user t2 on t1.user_id = t2.user_id where t1.article_id = ?';
    const sql1 = 'select*from usercollection where article_id = ? and user_id=?';
    db.query(sql,article_id,(err,result)=>{
        if(err){
            return res.cc(err.message);
        } else if(result.length <= 0){
            return res.cc('获取文章详情失败',400);
        } else {
            result = JSON.parse(JSON.stringify(result))
            db.query(sql1,[article_id,user_id],(err1,result1)=>{
                if(err){
                    return res.cc(err1.message);
                } else {
                    if(result1.length===1){
                        result[0].isCollection = true;
                    } else {
                        result[0].isCollection = false;
                    }
                    return res.send({
                        status:200,
                        message:'获取文章详情成功',
                        data:result[0],
                    })
                }
            })

        }
    })
}