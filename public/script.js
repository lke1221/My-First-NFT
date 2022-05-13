window.onload = function(){
    const ethereumButton = document.querySelector('.enableEthereumButton');

    ethereumButton.addEventListener('click', () => {
        //Will Start the metamask extension
        const accounts = ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
    });
}
