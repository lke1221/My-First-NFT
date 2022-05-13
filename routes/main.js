var express = require('express');
var router = express.Router();
router.use(express.json());
var multer = require('multer');
var crypto = require('./crypt/crypt');

var storage = multer.memoryStorage();
var uploadFile = multer({ storage: storage });

router.get('/', function(req,res){
    res.render('main');
});

router.get('/upload', function(req,res){
    res.render('upload');
});

router.post('/encrypt_then_mint', function(req, res){
    console.log(req.body.pk);
});

router.post('/uploadFile', uploadFile.single('userFile'), function(req, res){
    var filePath = 'C:/Exception/upload/'; 
    var fileName = req.file.originalname;
    crypto.saveEncryptedFile(req.file.buffer, filePath, fileName);
    res.render('confirmation');
    //res.render('confirmation', { file:req.file, files:null });
});

module.exports = router;