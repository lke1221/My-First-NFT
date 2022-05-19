const ethereumButton = document.querySelector('.enableEthereumButton');
const sendEthButton = document.querySelector('.sendEthButton');
const testDecrypt = document.querySelector('.testDecrypt');

// let accounts = [];
// let encryptionPublicKey;

sendEthButton.addEventListener('click', () => {
    get_pk();
});

testDecrypt.addEventListener('click', () => {
    decrypt_with_pk();
});

async function get_pk() {
    let accounts = [];
    accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    // ethereums
    // .request({
    //     method: 'eth_sendTransaction',
    //     params: [
    //     {
    //         from: accounts[0],
    //         to: '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
    //         value: '0x29a2241af62c0000',
    //         gasPrice: '0x09184e72a000',
    //         gas: '0x2710',
    //     },
    //     ],
    // })
    // .then((txHash) => console.log(txHash))
    // .catch((error) => console.error);
    ethereum
    .request({
    method: 'eth_getEncryptionPublicKey',
    params: [accounts[0]], // you must have access to the specified account
    })
    .then((result) => {
        mint_token(result);
    })
    .catch((error) => {
    if (error.code === 4001) {
        // EIP-1193 userRejectedRequest error
        console.log("We can't encrypt anything without the key.");
    } else {
        console.error(error);
    }
    });
}

function mint_token(pk){
    alert(pk);
    $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/encrypt_then_mint',
        data: JSON.stringify({"pk" : pk }),
        datatype: 'json',
        contentType: 'application/json; charset=utf-8',
        success: function(response) { 
         console.log(response);
        },
        error: function(xhr, status, err) {
          console.log(xhr.responseText);
        }
    });
}

async function decrypt_with_pk() {
    let accounts = [];
    accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    var encryptedMessage = "0x7b2276657273696f6e223a227832353531392d7873616c736132302d706f6c7931333035222c226e6f6e6365223a2264523533735a55413655437465476d2f626b7a495039425949676b5070793646222c22657068656d5075626c69634b6579223a2274734e62397a4e6e7237376b476a4376314c44523830672b6c754851734f614a63654c33693758425a31773d222c2263697068657274657874223a22467667707946582b6c4f5a75497a4162677577524e676648645a573031673d3d227d"; //필요할 때 채워넣을 것
    ethereum
    .request({
    method: 'eth_decrypt',
    params: [encryptedMessage, accounts[0]],
    })
    .then((decryptedMessage) =>
    console.log('The decrypted message is:', decryptedMessage)
    )
    .catch((error) => console.log(error.message));
}
  