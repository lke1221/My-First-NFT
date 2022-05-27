//Contract based on [https://docs.openzeppelin.com/contracts/3.x/erc721](https://docs.openzeppelin.com/contracts/3.x/erc721)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

import "hardhat/console.sol";

contract KeyNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("KeyNFT", "NFT") {}

    function mintNFT(address recipient, string memory encryptedKey, string memory contentID)
        public onlyOwner
        returns (uint256)
    {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _safeMint(recipient, newItemId); //mint를 safemint로 바꿈
        
        bytes memory json = abi.encodePacked('{"contentID": "', contentID, '", "encryptedKey": "', encryptedKey, '"}');

        _setTokenURI(newItemId, string(abi.encodePacked("data:application/json;base64,", Base64.encode(json))));

        return newItemId;
    }
}
