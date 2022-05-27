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

// content nft
const cContract = require("../artifacts/contracts/ContentNFT.sol/ContentNFT.json");
const cContractAddress = process.env.CNFT_CONTRACT_ADDRESS;
const contentContract = new web3.eth.Contract(cContract.abi, cContractAddress);

// key nft
const kContract = require("../artifacts/contracts/KeyNFT.sol/KeyNFT.json");
const kContractAddress = process.env.KNFT_CONTRACT_ADDRESS;
const keyContract = new web3.eth.Contract(kContract.abi, kContractAddress);


router.get('/', function(req,res){
    res.render('main');
});

router.get('/upload', function(req,res){
  res.render('upload');
});

router.post('/uploadFile', uploadFile.single('userFile'), function(req, res){
    const filePath = 'C:/Exception/upload/';
    const fileName = req.file.originalname;
    const [masterKey, filenames] = crypto.saveEncryptedFile(req.file.buffer, filePath, fileName);

    let fileloc = "";
    for(const loc of filenames){
      fileloc += loc;
      fileloc += ",";
    }

    const contentName = req.body.contentName;
    const author = req.body.contentAuthor;
    
    const io = req.app.get('socketio');

    io.on('connect', (socket)=>{

      socket.emit('get_pk_and_address');

      socket.on('address_and_pk_back', (pk, address)=>{ //metamask 주소와 pk받음

        const txCNFTData = contentContract.methods.mintNFT(address, contentName, author, fileloc).encodeABI();
        socket.emit("make_CNFT_transaction", cContractAddress, txCNFTData);
        socket.on("CNFT_transaction_back", (txHash)=>{
          // pk로 masterkey encrypt
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
          console.log(txHash);
          
          // contents NFT ID 받아온 후에 주석 풀어서 작동시켜볼 것.
          // key NFT 발급
          const txKNFTData = keyContract.methods.mintNFT(address, encryptedKey, txHash).encodeABI()
          socket.emit('make_KNFT_transaction', kContractAddress, txKNFTData);
        })
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