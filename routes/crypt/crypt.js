const fs = require('fs');
const crypto = require('crypto');
const deploy = require('../../scripts/deploy')
const path = require('path');

const SLICE_SIZE = 1000000000 //암호화할 파일을 자를 크기 (1GB)

const encrypt_detail = (algorithm, masterKey, buffer) => { //실제로 암호화 하는 함수
    const iv = crypto.randomBytes(16)
    const salt = crypto.randomBytes(64)
    const key = crypto.pbkdf2Sync(masterKey, salt, 2145, 32, 'sha512')
    const cipher = crypto.createCipheriv(algorithm, key, iv)
    const sliced_buf = Buffer.concat([cipher.update(buffer), cipher.final()])
    const tag = cipher.getAuthTag()

    const cipher_result = Buffer.concat([salt, iv, tag, sliced_buf])
    return cipher_result
}

const encrypt = (buffer) => { //암호화하기 위해 쪼개는 함수
    const algorithm = 'aes-256-gcm'
    const masterKey = '123456'    //반드시 고쳐야함! 임시. 랜덤으로 생성하게 하는 게 나을듯?

    const sliced_cipher = []
    for(let i=0; buffer.length > SLICE_SIZE;){
        sliced_cipher.push(encrypt_detail(algorithm, masterKey, buffer.slice(i, i+SLICE_SIZE)))
        buffer = buffer.subarray(i+SLICE_SIZE)
    }
    sliced_cipher.push(encrypt_detail(algorithm, masterKey, buffer))

    return {masterKey: masterKey, result: sliced_cipher}
}
  
const decrypt = (buffers) => {
    const algorithm = 'aes-256-gcm'
    const masterKey = '123456'    //반드시 고쳐야함! 임시. 랜덤으로 생성하게 하는 게 나을듯?

    const result = []
    for(var i=0; i<buffers.length; i++){
        const buffer = buffers[i]
        const bData = Buffer.from(buffer, 'base64');
        const salt = bData.subarray(0, 64); // Buffer.slice는 deprecated. 대신 subarray로 수정
        const iv = bData.subarray(64, 80);
        const tag = bData.subarray(80, 96);
        const encrypted_data = bData.subarray(96);
    
        const key = crypto.pbkdf2Sync(masterKey, salt , 2145, 32, 'sha512');
        const decipher = crypto.createDecipheriv(algorithm, key, iv)
        decipher.setAuthTag(tag)
        const decrypted = decipher.update(encrypted_data);

        result.push(decrypted)
    }

    const decrypted_result = Buffer.concat(result)
    return decrypted_result;
}
  
const saveEncryptedFile = (buffer, fileDir, fileName) => {

    if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir)
    }

    var encrypted_result = encrypt(buffer)

    var date = Date.now(); //중복 방지 위해서 날짜
    var fileName_no_ext = path.parse(fileName).name
    var extension = path.parse(fileName).ext

    var result = encrypted_result.result
    var result_len = result.length

    var filePath_for_json = ""
    for(var i=0; i<result.length; i++){
        encrypted_fileName = fileDir+fileName_no_ext+'_'+result_len+'_'+i+extension
        filePath_for_json = filePath_for_json+encrypted_fileName+" "
        fs.writeFileSync(encrypted_fileName, result[i])
    }

    //decrypt 테스트 시 사용
    fs.writeFileSync(fileDir+'decrypted_'+fileName, decrypt(result))

    //NFT mint하는 함수 call (매개변수는 masterkey. 그걸 암호화해서 NFT metadata(=JSON file)에 넣어야 하므로)
    /*try{
        var tokenId = deploy.mintNFT(jsonFilePath);
        const data = {
            "id": tokenId, //여기도 tokenId가 들어가야 할 것 같은데
            "description": "My NFT", //필요할까?
            "external_url": "https://forum.openzeppelin.com/t/create-an-nft-and-deploy-to-a-public-testnet-using-truffle/2961", //필요할까?
            "encrypted_key": encrypted_result.masterKey, //지금은 masterKey가 그냥 들어가지만 최종 결과물은 masterKey가 들어가면 안됨!!! (사용자가 요청했을 때만 암호화해서 주도록)
            "image": filepath, 
            "name": fileName
        }
        fs.writeFileSync(jsonFilePath, JSON.stringify(data))
    } catch(error){
        console.log(error)
    }*/

    //NFT에 넣을 JSON file 생성하는 방법 : 매개변수로 encrypted_result.masterKey 줄 것
    //json 파일 이름을 tokenId 넣어서 정해야할 것 같은데 (중복 방지) 일단은 테스트 목적으로 정함. 나중에 수정 필요
    var jsonFilePath = fileDir+fileName_no_ext+'_'+date+'.json'
    const data = {
        "description": "My NFT", //필요할까?
        "external_url": "https://forum.openzeppelin.com/t/create-an-nft-and-deploy-to-a-public-testnet-using-truffle/2961", //필요할까?
        "encrypted_key": encrypted_result.masterKey, //지금은 masterKey가 그냥 들어가지만 최종 결과물은 masterKey가 들어가면 안됨!!! (사용자가 요청했을 때만 암호화해서 주도록)
        "files": filePath_for_json, 
        "name": fileName
    }
    fs.writeFileSync(jsonFilePath, JSON.stringify(data))

    return encrypted_result.masterKey;

}

module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;
module.exports.saveEncryptedFile = saveEncryptedFile;