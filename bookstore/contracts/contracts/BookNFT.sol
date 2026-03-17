// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BookNFT is ERC721URIStorage, Ownable {

    uint256 public nextTokenId; 

    event BookMinted(
            uint256 indexed tokenId, 
            address indexed author, 
            string metadataURI
        );

    
    constructor () ERC721("BookNFT", "BOOK") Ownable (msg.sender) {}

    function mintBook(address author, string memory metadataURI) external onlyOwner {
        uint256 tokenId = nextTokenId; 
        _safeMint(author,tokenId);
        _setTokenURI(tokenId, metadataURI);

        emit BookMinted(tokenId, author, metadataURI);
        nextTokenId++; 
    }


}