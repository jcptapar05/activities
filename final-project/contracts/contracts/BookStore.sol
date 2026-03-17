// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BookStore is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    struct Book {
        uint256 id;
        string title;
        string authorName;
        uint256 price;
        string image;
        string bookfile;
        bool listed;
        string genre;
        string isbn;
        address owner;
    }

    mapping(uint256 => Book) private _books;
    uint256[] private _allBookIds;

    event BookMinted(
        uint256 indexed tokenId,
        address indexed to,
        string title,
        string authorName
    );

    event BookListed(uint256 indexed tokenId, uint256 price);
    event BookSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event BookListingCancelled(uint256 indexed tokenId);
    event BookUpdated(uint256 indexed tokenId);
    event BookDeleted(uint256 indexed tokenId);

    constructor() ERC721("BookStore", "BS") Ownable(msg.sender) {}

    function mint(
        address to,
        string memory title,
        string memory authorName,
        uint256 price,
        string memory image,
        string memory bookfile,
        string memory metadataURL,
        string memory genre,
        string memory isbn
    ) public {
        _nextTokenId++;
        uint256 tokenId = _nextTokenId;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURL);

        _books[tokenId] = Book({
            id: tokenId,
            title: title,
            authorName: authorName,
            price: price,
            image: image,
            bookfile: bookfile,
            listed: price > 0,
            genre: genre,
            isbn: isbn,
            owner: to
        });

        _allBookIds.push(tokenId);

        emit BookMinted(tokenId, to, title, authorName);

        if (price > 0) {
            emit BookListed(tokenId, price);
        }
    }

    function getBook(uint256 tokenId) public view returns (Book memory) {
        require(_ownerOf(tokenId) != address(0), "Book does not exist");
        return _books[tokenId];
    }

    function getAllBooks() public view returns (Book[] memory) {
        uint256 count = _allBookIds.length;
        Book[] memory books = new Book[](count);

        for (uint256 i = 0; i < count; i++) {
            books[i] = _books[_allBookIds[i]];
        }

        return books;
    }

    function listBook(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(price > 0, "Price must be greater than zero");

        _books[tokenId].price = price;
        _books[tokenId].listed = true;

        emit BookListed(tokenId, price);
    }

    function cancelListing(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");

        _books[tokenId].price = 0;
        _books[tokenId].listed = false;

        emit BookListingCancelled(tokenId);
    }

    function buyBook(uint256 tokenId) public payable {
        address seller = ownerOf(tokenId);
        Book storage book = _books[tokenId];

        require(book.listed, "Book is not listed");
        require(msg.value >= book.price, "Insufficient payment");
        require(msg.sender != seller, "Seller cannot buy own book");

        uint256 salePrice = book.price;

        book.price = 0;
        book.listed = false;
        book.owner = msg.sender;

        _transfer(seller, msg.sender, tokenId);
        (bool success, ) = seller.call{value: salePrice}("");
        require(success, "Transfer failed");

        if (msg.value > salePrice) {
            (bool successTwo, ) = msg.sender.call{value: msg.value - salePrice}("");
            require(successTwo, "Transfer failed");
        }

        emit BookSold(tokenId, seller, msg.sender, salePrice);
    }

    function updateBook(
        uint256 tokenId,
        string memory title,
        string memory authorName,
        uint256 price,
        string memory image,
        string memory bookfile,
        string memory metadataURL,
        string memory genre,
        string memory isbn
    ) public {
        require(ownerOf(tokenId) == msg.sender || owner() == msg.sender, "Not authorized");

        _books[tokenId].title = title;
        _books[tokenId].authorName = authorName;
        _books[tokenId].price = price;
        _books[tokenId].image = image;
        _books[tokenId].bookfile = bookfile;
        _books[tokenId].listed = price > 0;
        _books[tokenId].owner = msg.sender;
        _books[tokenId].genre = genre;
        _books[tokenId].isbn = isbn;

        _setTokenURI(tokenId, metadataURL);

        emit BookUpdated(tokenId);
    }

    function deleteBook(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender || owner() == msg.sender, "Not authorized");

        _burn(tokenId);
        delete _books[tokenId];

        emit BookDeleted(tokenId);
    }

    function transferBook(address to, uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        safeTransferFrom(msg.sender, to, tokenId);

        _books[tokenId].price = 0;
        _books[tokenId].listed = false;
        _books[tokenId].owner = to;
    }

    function getBooksByOwner(address bookOwner) public view returns (Book[] memory) {
        uint256 total = _allBookIds.length;
        uint256 count = 0;

        for (uint256 i = 0; i < total; i++) {
            uint256 tokenId = _allBookIds[i];
            if (_ownerOf(tokenId) == bookOwner) {
                count++;
            }
        }

        Book[] memory books = new Book[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < total; i++) {
            uint256 tokenId = _allBookIds[i];
            if (_ownerOf(tokenId) == bookOwner) {
                books[index] = _books[tokenId];
                index++;
            }
        }

        return books;
    }
}