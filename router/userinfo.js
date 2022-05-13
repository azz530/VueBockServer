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
router.get('/getAllArticle',userinfo.getAllArticle);

router.post('/addCollection',userinfo.addCollection);
router.post('/delCollection',userinfo.delCollection);

router.get('/getArticleDetails',userinfo.getArticleDetails);

router.post('/addComments',userinfo.addComments);
router.post('/addReplay',userinfo.addReplay);

let Picstorage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'picture');
    },
    filename:function(req,file,cb){
        cb(null,Date.now()+Math.round(Math.random()*100)+file.originalname);
    }
})
let uploadPic = multer({storage:Picstorage});

router.get('/getMyAlbum',userinfo.getMyAlbum);
router.post('/addAlbum',uploadPic.any(),userinfo.addAlbum);
router.get('/getAlbumDetails',userinfo.getAlbumDetails);
router.post('/uploadPhoto',uploadPic.any(),userinfo.uploadPhoto);
router.delete('/delPhoto',userinfo.delPhoto);
router.delete('/delAlbum',userinfo.delAlbum);
router.post('/changeAlbum',uploadPic.any(),userinfo.changeAlbum);
router.get('/getMyCollection',userinfo.getMyCollection);
router.get('/getMyHistory',userinfo.getMyHistory);
router.post('/addHistory',userinfo.addHistory);


module.exports = router