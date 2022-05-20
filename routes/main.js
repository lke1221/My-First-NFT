const express = require('express');
const router = express.Router();
router.use(express.json());

// file upload
const multer = require('multer');
const storage = multer.memoryStorage();
const uploadFile = multer({ storage: storage });

// file encrypt
const crypto = require('./crypt/crypt');

// key encrypt (with blockchain wallet key)
const ethUtil = require('ethereumjs-util');
const sigUtil = require('@metamask/eth-sig-util');

// mint nft
require("dotenv").config();
const API_URL = process.env.API_URL;
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(API_URL);
const contract = require("../artifacts/contracts/MyNFT.sol/MyNFT.json");
const contractAddress = "0xf29AC9223B51261E478fDd4827E95466e629De82";
const nftContract = new web3.eth.Contract(contract.abi, contractAddress);


router.get('/', function(req,res){
    res.render('main');
});

router.get('/upload', function(req,res){
  res.render('upload');
});

router.post('/uploadFile', uploadFile.single('userFile'), function(req, res){
    const filePath = 'C:/Exception/upload/';
    const fileName = req.file.originalname;
    const masterKey = crypto.saveEncryptedFile(req.file.buffer, filePath, fileName);
    
    const io = req.app.get('socketio');

    io.on('connect', (socket)=>{

      socket.emit('get_pk', masterKey)

      socket.on('mint_token', (pk, address, masterKey)=>{
        const encryptedKey = ethUtil.bufferToHex(
          Buffer.from(
            JSON.stringify(
              sigUtil.encrypt({
                publicKey: pk,
                data: masterKey,
                version: 'x25519-xsalsa20-poly1305',
              })
            ),
            'utf8'
          )
        );
        const txData = nftContract.methods.mintNFT(address, encryptedKey).encodeABI()
        socket.emit('make_transaction', txData);
      });

      socket.on('disconnect', (reason)=>{
        console.log(`연결 종료: ${reason}`);
      })

      socket.on('error', (error)=>{
        console.log(`에러 발생: ${error}`);
      })

    })
    res.render('confirmation');
});

// Not used - data 주고 받는 방식이 바뀌면서 안 씀
// router.post('/encrypt_then_mint', function(req, res){
//     const encryptedKey = ethUtil.bufferToHex(
//         Buffer.from(
//           JSON.stringify(
//             sigUtil.encrypt({
//               publicKey: req.body.pk,
//               data: req.body.masterKey,
//               version: 'x25519-xsalsa20-poly1305',
//             })
//           ),
//           'utf8'
//         )
//     );
//     console.log(encryptedKey);

//     const txData = nftContract.methods.mintNFT(req.body.address, encryptedKey).encodeABI()
    
//     const io = req.app.get('socketio');
//     io.on('connect', (socket)=>{
//       console.log("transaction connect 완료");
//       socket.emit('make_transaction', txData);
//     })
// });

module.exports = router;