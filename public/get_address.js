const ethereumButton = document.querySelector('.enableEthereumButton');
const sendEthButton = document.querySelector('.sendEthButton');
const submitButton = document.querySelector('.submitFile');

let accounts = [];
let encryptionPublicKey;

sendEthButton.addEventListener('click', () => {
    get_pk();
});

submitButton.addEventListener('submit', () => {
    const input_file = document.querySelector('.input_file');
    get_pk(input_file);
});

async function get_pk() {
    accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    // ethereum
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

  