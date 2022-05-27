# NFT Secure Storage Project  
</br>

백엔드: Node.js  
Blockchain Wallet : Metamask  
Network: ~Ropsten~ -> Rinkeby Testnet (Ropsten 사용하다가 `exceeds block gas limit` 문제로 변경)  
Contents NFT Contranct Address: 0xf29AC9223B51261E478fDd4827E95466e629De82  
Key NFT Contract Address: 0x55e5E01B2aac71A83A264f04879060eBfb76067d  
</br>

초기의 기본적인 세팅은 아래 링크를 참고하였습니다.  
https://ethereum.org/en/developers/tutorials/how-to-write-and-deploy-an-nft/ (1편)  
https://ethereum.org/en/developers/tutorials/how-to-mint-an-nft/ (2편)  
https://ethereum.org/en/developers/tutorials/how-to-view-nft-in-metamask/ (3편)  
* 단, 3편에 소개되어 있는 방법대로는 발급된 NFT의 상세정보를 확인할 수는 없습니다. 상세정보 확인을 위해 etherscan.io를 활용합니다.  

## Contract deploy 하는 방법  
1. hardhat을 이용할 예정이므로 우선 hardhat부터 설치합니다. (hardhat: 이더리움 소프트웨어 compile, deploy, test를 위한 개발 환경)  
```
npm install --save-dev hardhat
```
* save dev 옵션: package.json 내의 devDependencies 항목에 설치한 모듈과 버전을 추가합니다.  
2. npx hardhat 명령어 실행 후, Create an empty hardhat.config.js를 선택합니다.  
3. contracts 디렉토리 안에 필요한 Contract를 작성합니다 (이 프로젝트의 경우 KeyNFT.sol, ContentNFT.sol)  
4. hardhat.config.js 파일을 상황에 맞게 수정합니다(testnet 종류 등). 단, 파일 작성에 필요한 API_URL과 PRIVATE_KEY 등의 정보를 주기 위해서 .env를 이용합니다. __private key의 경우 절대 노출되어서는 안됩니다!!! 따라서 반드시 .env 파일에 입력하고, .gitignore에 추가해야 합니다__  
5. 작성한 컨트랙트를 컴파일합니다.  
```
npx hardhat compile
```
6. 이어서 scripts 디렉토리 안에 있는 deploy.js를 실행합니다. (이 프로젝트의 경우, cNFT_deploy.js 와 kNFT_deploy.js)  
```
npx hardhat --network rinkeby run scripts/cNFT_deploy.js
npx hardhat --network rinkeby run scripts/kNFT_deploy.js
```
(단, network 옵션은 상황에 맞게 변경할 것)  
7. deploy된 후에 `Contract deployed to address : `로 출력되는 주소를 확인할 수 있는데, 이것이 NFT mint할 때마다 사용할 컨트랙트의 주소입니다.  
8. 주소를 다른 파일에서 사용할 수 있도록 .env 파일에 추가합니다 (CNFT_CONTRACT_ADDRESS, KNFT_CONTRACT_ADDRESS).  
### deploy를 마친 후에는 deploy.js 파일을 주석처리 해야합니다. 그렇지 않으면 node server.js를 실행할 때마다 contract가 새로 deploy됩니다.  
</br>

## Content NFT와 key NFT의 관계  
Content NFT 발급 transaction의 hash가 key NFT에 올라감으로써 두 NFT가 서로 연관성을 갖습니다.  
* 원래 transaction hash가 아닌 tokenID를 기록할 계획이었으나, transaction 요청을 위해 Metamask RPC API를 사용하다보니 confirm 될 때까지 기다리는 데 어려움이 있었습니다. confirm이 된 후에야 tokenID를 알 수 있기 때문에 tokenID 대신 transaction hash로 대체하였습니다. web3를 이용하면 confirm 될 때까지 기다릴 수 있는 것 같아서 시도해보았지만ㅡ 브라우저 지갑인 metamask와의 연결이 쉽지 않아서 일단 남겨뒀습니다. **나중에 시도해볼 것**  
</br>

## Socket.io  
해당 프로젝트에서는 서버와 클라이언트의 통신을 위해 처음에는 Ajax를 사용했다가, 이후 Socket.io로 변경하였습니다.  
프로젝트를 진행하면서 배우게 된 Ajax, WebSocket, Socket.io의 비교는 다음과 같습니다.  
1. AJAX : 
HTTP의 한계점인 지속적인 연결 불가능을 극복하고자 나타난 기술. 일반적으로 웹의 프로토콜(HTTP, HTTPS)은 클라이언트에서 서버에 요청을 요구해야 서버가 보낸 응답을 통해 화면이 출력되는데, 이 방식으로는 실시간으로 데이터를 갱신하거나 인터렉티브한 동적인 웹서비스를 구현할 수 없기 때문.  
데이터를 get이나 post방식으로 submit하고, 답이 돌아오면 콜백함수를 부른다 (콜백함수로 페이지 갱신 가능). 연결을 위한 지연 시간이 없다. 페이지를 보내고 받는 시간만 존재할 뿐. 그러나 HTTP방식으로 보내기 때문에 http 프로토콜을 반드시 따라야한다(=헤더와 같은 필수정보를 포함해야 한다). 이것이 트래픽 소모를 증가시킨다.  
AJAX의 기법에는 폴링, 롱 폴링, 스트리밍 방식이 있다.  
    - 폴링: 화면 업데이트 함수를 작성하고, 일정 주기마다 함수 호출(setInterval() 이용!).  
    - 롱폴링: 서버에서 응답이 올 때까지 클라이언트가 계속 접속 유지. 응답이 오면 데이터 처리한 동시에 접속이 끊어지는데, 이 때 접속을 다시 유지하기 위한 새로운 코드를 작성한다. 대기+종료생성을 계속해서 반복하는 방식.  
    - 스트리밍: 서버에 요청을 보내지 않고 연결이 계속된 상태에서 끊임없이 데이터를 수신하는 것. 이벤트 빈도수가 높을 때 폴링이나 롱폴링에 비해 효율적이지만, 유효성 관리가 부담이다.  
</br>

2. WebSocket:  
웹에서 사용하기 위한 소켓. HTML5 웹 표준 기술. HTTP와 같은 80번 포트를 사용하기 때문에 기업용 애플리케이션에 적용할 때 방화벽 관련 설정을 따로 하지 않는다.  
AJAX의 비동기는 결국 편법에 불가능하기에(?) 생겨난 기술이다. WebSocket을 사용하면 클라이언트와 서버가 아무런 제약없이 통신할 수 있다. 일방적인 서버에서의 push 가능!! (위에서 편법이라고 말씀하신 게 아마 일방적인 서버에서의 push 관련인듯..) AJAX와 달리 헤더 없이 순수한 데이터만 전송이 가능하다.  
HTML5 기술이기 때문에 이전 버전의 웹 브라우저에서 지원이 되지 않는다. => **이 문제를 해결해준 게 socket.io**  
</br>

3. Socket.io:  
양방향 통신을 위해 웹소켓 기술을 사용하는 '라이브러리'.  자바스크립트를 이용하여 브라우저의 종류에 상관없이 실시간 웹을 구현할 수 있다.  단, 페이지를 이동하면 연결이 끊긴다. frame이용이나 angular.js 등의 방식으로 single web page를 구현하는 것이 해결책이 될 수 있음.  
fallback을 지원한다 (fallback: 소켓 연결 실패 시 다른 방식으로 클라이언트와 연결을 시도하는 것)  
</br>

언제 Socket.io를 사용하고, 언제 WebSocket을 사용할지에 대한 답변이 달린 글  
(https://stackoverflow.com/questions/10112178/differences-between-socket-io-and-websockets)  
</br>  

## 프로젝트 하면서 배운 블록체인 개념 정리:  
* blockchain의 block은 아직 validate 되지 않은 여러 개의 transaction을 포함한다.  
* 즉 block과 transaction 사이에 일대일 관계가 성립하지 않는다. => Bitcoin, Ether, NFT 역시 block과 동의어가 아니다.  
* NFT의 metadata에 소유자 정보가 기록되는 것은 아니다. => 소유자 정보가 metadata에 기록된다면 transaction이 일어날 때마다 NFT의 metadata가 변해야하는데, '변하지 않는' NFT의 특성 상 말이 되지 않으므로  
* 소유자 정보의 변화는 block에 기록되는 내용이다.  
* 소유자 정보는 mapping으로 기록된다. openzepplin의 ERC-721.sol을 보면  
```solidity
mapping(uint256=>address) private _owners;
```
라는 부분이 있다.  
* 이 mapping은 어디에 기록되는가?  
https://ethereum.stackexchange.com/questions/18885/where-are-the-variables-of-a-smart-contract-stored  
contract의 storage에 보관된다.  
</br>

* 블록체인 지갑 생성 시 무작위 문자가 생김 => 개인키 (256bit 숫자)  
* 이 개인키에 타원곡선 암호 알고리즘을 적용 => 공개키 (256bit 숫자)  
* 공개키에 해시함수(keccak-256)를 적용하여 => 지갑 주소  