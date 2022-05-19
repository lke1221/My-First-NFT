const express = require('express');
const router = express.Router();
router.use(express.json());
const multer = require('multer');
const crypto = require('./crypt/crypt');

const ethUtil = require('ethereumjs-util');
const sigUtil = require('@metamask/eth-sig-util');

const storage = multer.memoryStorage();
const uploadFile = multer({ storage: storage });

var masterKey;

router.get('/', function(req,res){
    res.render('main');
});

router.get('/upload', function(req,res){
    res.render('upload');
});

router.post('/encrypt_then_mint', function(req, res){
    console.log(req.body.pk);
    console.log(masterKey);
    const encryptedMessage = ethUtil.bufferToHex(
        Buffer.from(
          JSON.stringify(
            sigUtil.encrypt({
              publicKey: req.body.pk,
              data: masterKey,
              version: 'x25519-xsalsa20-poly1305',
            })
          ),
          'utf8'
        )
    );
    console.log(encryptedMessage);
});

router.post('/uploadFile', uploadFile.single('userFile'), function(req, res){
    var filePath = 'C:/Exception/upload/';
    var fileName = req.file.originalname;
    masterKey = crypto.saveEncryptedFile(req.file.buffer, filePath, fileName);
    res.render('confirmation');
    //res.render('confirmation', { file:req.file, files:null });
});

module.exports = router;