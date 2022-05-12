const db = require('../db');
const config = require('../config');

//退出登录
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
//获取用户信息
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
//修改用户信息
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
//获取用户发表的文章
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
//发布文章
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
//获取所有文章
exports.getAllArticle = (req, res) => {
    let pageNum = parseInt(req.query.pageNum) - 1;
    let pageSize = parseInt(req.query.pageSize);
    const user_id = parseInt(req.query.user_id);
    const sortType = req.query.sortType;
    const sql = sortType === 'time' ?   //按时间排序还是按收藏数排序
        'select t1.article_id,t1.article_title,t1.article_tags,t1.article_time, count(t2.user_id) as collection_num from article t1 left join usercollection t2 on t1.article_id = t2.article_id group by t1.article_id order by t1.article_time desc limit ?,?' :
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
//添加收藏
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
//取消收藏
exports.delCollection = (req, res) => {
    const article_id = req.body.article_id;
    const user_id = req.body.user_id;
    const sql = 'delete from usercollection where article_id=? and user_id=?';
    db.query(sql, [article_id, user_id], (err, result) => {
        if (err) {
            return res.cc(err.message);
        } else if (result.affectedRows !== 1) {
            return res.cc('取消收藏失败', 400);
        } else {
            return res.cc('取消收藏成功', 200);
        }
    })
}
//获取文章信息、评论信息、回复信息
exports.getArticleDetails = (req, res) => {
    const article_id = req.query.article_id;
    const user_id = parseInt(req.query.user_id);
    //搜索文章内容
    const sql = 'select t1.article_id,t1.article_title,t1.article_tags,t1.article_time,t1.article_content,t2.username,t2.avatar from article t1 left join user t2 on t1.user_id = t2.user_id where t1.article_id = ?';
    //搜索对文章的评论
    const sql_comment = 'select comments_id,comments_content,comments_time,avatar,username,comments_uid from comments left join user on comments.comments_uid = user.user_id left join article on comments.comments_articleid = article.article_id where article_id = ?';
    //搜索对评论的回复内容
    const sql_replay = 'select replay_id,replay_content,replay_time,replay.comments_id,fromUser.user_id as fromUid,fromUser.username as fromUsername,fromUser.avatar as fromAvatar,toUser.user_id as toUid,toUser.username as toUsername,toUser.avatar as toAvatar from replay left join comments on replay.comments_id = comments.comments_id left join article on comments.comments_articleid = article.article_id left join user fromUser on replay.from_uid = fromUser.user_id left join user toUser on replay.to_uid = toUser.user_id where article.article_id = 9 order by replay.replay_time asc'
    //查询是否在用户的收藏当中
    const sql1 = 'select*from usercollection where article_id = ? and user_id=?';
    db.query(sql, article_id, (err, result) => {
        if (err) {
            return res.cc(err.message);
        } else if (result.length <= 0) {
            return res.cc('获取文章详情失败', 400);
        } else {
            result = JSON.parse(JSON.stringify(result))
            db.query(sql1, [article_id, user_id], (err1, result1) => {
                if (err) {
                    return res.cc(err1.message);
                } else {
                    if (result1.length === 1) {
                        result[0].isCollection = true;
                    } else {
                        result[0].isCollection = false;
                    }// 判断文章是否在用户收藏当中
                    db.query(sql_comment, article_id, (err2, comments) => {
                        if (err2) {
                            return res.cc(err2.message);
                        } else {
                            comments = JSON.parse(JSON.stringify(comments))
                            result[0].comments = comments;//文章的评论信息

                            db.query(sql_replay, article_id, (err3, replay) => {
                                if (err3) {
                                    return res.cc(err3.message);
                                } else {
                                    replay = JSON.parse(JSON.stringify(replay))
                                    const newComments = result[0].comments.map(item => {
                                        const obj = { ...item }
                                        const replayArr = replay.filter(i => i.comments_id === item.comments_id);
                                        obj.replay = replayArr;
                                        return obj
                                    })//每条评论当中的回复信息
                                    result[0].comments = newComments;
                                    return res.send({
                                        status: 200,
                                        message: '获取文章详情成功',
                                        data: result[0],
                                    })
                                }
                            })
                        }
                    })
                }
            })

        }
    })
}
//发表评论
exports.addComments = (req, res) => {
    const commentsInfo = req.body;
    commentsInfo.comments_time = new Date();
    const sql = 'insert into comments set ?';
    db.query(sql, commentsInfo, (err, result) => {
        if (err) {
            return res.cc(err.message);
        } else if (result.affectedRows !== 1) {
            return res.cc('新增评论失败', 400);
        } else {
            return res.cc('新增评论成功', 200);
        }
    })
}
//发表回复
exports.addReplay = (req, res) => {
    const replayInfo = {
        comments_id: parseInt(req.body.comments_id),
        from_uid: parseInt(req.body.from_uid),
        replay_content: req.body.replay_content,
        to_uid: parseInt(req.body.to_uid),
        replay_time: new Date(),
    };
    const sql = 'insert into replay set ?';
    db.query(sql, replayInfo, (err, result) => {
        if (err) {
            return res.cc(err.message);
        } else if (result.affectedRows !== 1) {
            return res.cc('回复失败', 400);
        } else {
            return res.cc('回复成功', 200);
        }
    })
}
//获取用户相册
exports.getMyAlbum = (req, res) => {
    const user_id = parseInt(req.query.user_id);
    const sql = 'select * from album where album_uid = ? ';
    db.query(sql, user_id, (err, result) => {
        if (err) {
            return res.cc(err.message);
        } else if (result.length <= 0) {
            return res.cc('暂无相册', 400);
        } else {
            result = JSON.parse(JSON.stringify(result));
            return res.send({
                status: 200,
                message: '查询成功',
                data: result
            })
        }
    })
}
//新增相册
exports.addAlbum = (req, res) => {
    const albumInfo = {
        album_page: config.baseUrl + req.files[0].filename,
        album_name: req.body.album_name,
        album_description: req.body.album_description,
        album_uid: parseInt(req.body.user_id),
        album_time: new Date(),
    };
    const sql = 'insert into album set ?';
    db.query(sql, albumInfo, (err, results) => {
        if (err) {
            return res.cc(err.message);
        } else if (results.affectedRows !== 1) {
            return res.cc('新增相册失败', 400);
        } else {
            return res.cc('新增相册成功', 200);
        }
    })
}

//获取相册的照片信息
exports.getAlbumDetails = (req, res) => {
    const album_id = parseInt(req.query.album_id);
    let pageNum = parseInt(req.query.pageNum) - 1;
    let pageSize = parseInt(req.query.pageSize);
    const sql = 'select photo_id,photo_url,photo_time from album_photo left join album on album_photo.album_id = album.album_id where album_photo.album_id = ? order by photo_time desc limit ?,?';
    const sql_name = 'select album_name from album where album_id = ?';
    const sql_total = 'select count(*) as total from album_photo where album_id = ?';
    db.query(sql, [album_id, pageNum * pageSize, pageSize], (err, result) => {
        if (err) {
            return res.cc(err.message);
        } else if (result.length <= 0) {
            return res.cc('为查询到相片', 400);
        } else {
            db.query(sql_total, album_id, (err1, total) => {
                if (err1) {
                    return res.cc(err1.message);
                } else {
                    db.query(sql_name, album_id, (err2, album_name) => {
                        if (err2) {
                            return res.cc(err2.message);
                        } else {
                            return res.send({
                                status: 200,
                                message: '查询成功',
                                data: result,
                                total: total[0]['total'],
                                album_name:album_name[0]['album_name'],
                            })
                        }
                    })

                }
            })

        }
    })
}
//上传照片
exports.uploadPhoto = (req, res) => {
    let photolist = [];
    const album_id = req.body.album_id;
    if (req.files.length > 0) {
        req.files.forEach(item => {
            photolist.push(config.baseUrl + item.filename);
        })
    }
    const sql = 'insert into album_photo (album_id,photo_url,photo_time) values ?';
    let photoArr = [];
    let info = [];
    photolist.map(i => {
        info.push([album_id, i, new Date()])
    })
    photoArr.push(info)
    db.query(sql, photoArr, (err, result) => {
        if (err) {
            return res.cc(err.message);
        } else if (result.affectedRows < 1) {
            return res.cc('增加照片失败', 400);
        } else {
            return res.cc('新增照片成功', 200);
        }
    })
}
//删除照片
exports.delPhoto = (req,res) =>{
    const photo_id = parseInt(req.query.photo_id);
    const sql = 'delete from album_photo where photo_id =?';
    db.query(sql,photo_id,(err,result)=>{
        if(err){
            return res.cc(err.message);
        } else if(result.affectedRows !== 1){
            return res.cc('删除失败',400);
        } else {
            return res.cc('删除成功',200);
        }
    })
}
//删除相册
exports.delAlbum = (req,res) =>{
    const album_id = req.query.album_id;
    const sql = 'delete from album where album_id =?';
    db.query(sql,album_id,(err,result)=>{
        if(err){
            return res.cc(err.message);
        } else if(result.affectedRows !==1){
            return res.cc('删除失败',400);
        }else {
            return res.cc('删除成功',200);
        }
    })
}
//修改相册信息
exports.changeAlbum = (req,res) =>{
    let changeInfo = {};
    const album_id = parseInt(req.body.album_id);
    if(req.files.length>0){
        changeInfo = {
            album_name:req.body.album_name,
            album_description:req.body.album_description,
            album_page:config.baseUrl + req.files[0].filename,
        }
    } else {
        changeInfo = {
            album_name:req.body.album_name,
            album_description:req.body.album_description,
        }
    }
    const sql = 'update album set ? where album_id =?';
    db.query(sql,[changeInfo,album_id],(err,result)=>{
        if(err){
            return res.cc(err.message);
        } else if(result.affectedRows !==1 ){
            return res.cc('修改失败',400);
        } else {
            return res.cc('修改成功',200);
        }
    })
}