// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/*
 * PropertyRegistryERC721.sol
 *
 * Simple ERC-721 registry where each token represents a property deed.
 * - Uses OpenZeppelin ERC721, Ownable
 * - Anyone can call createProperty (or restrict by adding onlyOwner)
 * - Stores minimal on-chain metadata and an ipfs CID for full metadata/docs
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract PropertyRegistryERC721 is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    struct Property {
        uint256 tokenId;          // ERC-721 id
        address ownerWallet;      // owner wallet (recipient of the NFT)
        string ipfsMetadata;      // IPFS CID or URL pointing to off-chain metadata/docs
        uint256 valuation;        // optional numeric valuation (units defined by your app)
        uint256 monthlyRent;      // optional monthly rent (units defined by your app)
        uint256 createdAt;        // timestamp
    }

    // tokenId => Property
    mapping(uint256 => Property) private _properties;

    // Map tokenId to tokenURI (optional helper if you prefer storing full URI on-chain)
    mapping(uint256 => string) private _tokenURIs;

    // Events
    event PropertyCreated(uint256 indexed tokenId, address indexed ownerWallet, string ipfsMetadata);
    event PropertyMetadataUpdated(uint256 indexed tokenId, string ipfsMetadata);

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {}

    /**
     * @notice Create (register) a property and mint its ERC-721 "deed" to ownerWallet.
     * @param ownerWallet_ address that will receive the NFT (must not be zero)
     * @param ipfsMetadata_ IPFS CID or URL with full property metadata & docs (can be empty)
     * @param valuation_ optional numeric valuation (off-chain semantics)
     * @param monthlyRent_ optional monthly rent (off-chain semantics)
     *
     * Returns the new tokenId.
     */
    function createProperty(
        address ownerWallet_,
        string calldata ipfsMetadata_,
        uint256 valuation_,
        uint256 monthlyRent_
    ) external returns (uint256) {
        require(ownerWallet_ != address(0), "Invalid owner wallet");

        _tokenIdCounter.increment();
        uint256 newId = _tokenIdCounter.current();

        // Mint the ERC721 token to the property owner (safe mint)
        _safeMint(ownerWallet_, newId);

        // Record property
        _properties[newId] = Property({
            tokenId: newId,
            ownerWallet: ownerWallet_,
            ipfsMetadata: ipfsMetadata_,
            valuation: valuation_,
            monthlyRent: monthlyRent_,
            createdAt: block.timestamp
        });

        emit PropertyCreated(newId, ownerWallet_, ipfsMetadata_);

        return newId;
    }

    /**
     * @notice Optional helper to set a tokenURI string on-chain (if you want).
     * @dev Only token owner or contract owner can update tokenURI.
     */
    function setTokenURI(uint256 tokenId, string calldata tokenURI_) external {
        require(_exists(tokenId), "Nonexistent token");
        address tokenOwner = ownerOf(tokenId);
        require(msg.sender == tokenOwner || msg.sender == owner(), "Not authorized");
        _tokenURIs[tokenId] = tokenURI_;
        emit PropertyMetadataUpdated(tokenId, tokenURI_);
    }

    /**
     * @notice Get on-chain property summary for a tokenId.
     */
    function getProperty(uint256 tokenId) external view returns (Property memory) {
        require(_exists(tokenId), "Nonexistent token");
        return _properties[tokenId];
    }

    /**
     * @notice Get tokenURI stored on-chain (if any).
     */
    function tokenURIOnChain(uint256 tokenId) external view returns (string memory) {
        require(_exists(tokenId), "Nonexistent token");
        return _tokenURIs[tokenId];
    }

    /**
     * @notice Override ERC721.tokenURI to prefer on-chain tokenURIs if set, otherwise empty string.
     * You can override further to assemble ipfs:// + CID stored in _properties[tokenId].ipfsMetadata
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Nonexistent token");
        string memory onChain = _tokenURIs[tokenId];
        if (bytes(onChain).length > 0) {
            return onChain;
        }
        // If not set, but ipfsMetadata exists on property, return it (caller may be IPFS CID or full URL)
        string memory ipfsMeta = _properties[tokenId].ipfsMetadata;
        return ipfsMeta;
    }

    // Admin helper: set contract-level metadata (optional)
    string private _contractURI;
    function setContractURI(string calldata uri_) external onlyOwner {
        _contractURI = uri_;
    }
    function contractURI() external view returns (string memory) {
        return _contractURI;
    }
}
