const express = require('express');
const router = express.Router();
const userinfo = require('../router_handle/userinfo');
const multer = require('multer');
let Avatarstorage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'avatar');
    },
    filename:function(req,file,cb){
        cb(null,Date.now()+Math.round(Math.random()*100)+file.originalname);
    }
})
let uploadAvatar = multer({storage:Avatarstorage});

router.post('/editorUserInfo',uploadAvatar.any(),userinfo.editorUserInfo);
router.get('/getUserInfo',userinfo.getUserInfo);
router.post('/logout',userinfo.logout);
router.get('/getMyArticle',userinfo.getMyArticle);
router.post('/addArticle',userinfo.addArticle);

module.exports = router