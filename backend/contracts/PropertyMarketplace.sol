// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PropertyMarketplace is ReentrancyGuard, Ownable {
    struct MarketListing {
        uint256 listingId;
        uint256 propertyId;
        address seller;
        uint256 price;
        bool isActive;
        uint256 createdAt;
        uint256 expiresAt;
        ListingType listingType;
        uint256 amount; // For fractional tokens
    }
    
    enum ListingType { FULL_PROPERTY, FRACTIONAL_TOKENS }
    
    // Contract addresses
    address public propertyRegistryAddress;
    
    // Marketplace fees
    uint256 public marketplaceFee = 250; // 2.5% (250 basis points)
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    // Listings management
    uint256 private _listingIdCounter = 0;
    mapping(uint256 => MarketListing) private _marketListings;
    mapping(uint256 => uint256[]) private _propertyListings; // propertyId => listingIds
    uint256[] private _activeListings;
    
    // Events
    event PropertyListed(
        uint256 indexed listingId, 
        uint256 indexed propertyId, 
        address indexed seller, 
        uint256 price, 
        ListingType listingType,
        uint256 amount
    );
    event PropertySold(
        uint256 indexed listingId,
        uint256 indexed propertyId, 
        address indexed seller, 
        address buyer, 
        uint256 price
    );
    event ListingCancelled(uint256 indexed listingId, address indexed seller);
    event ListingUpdated(uint256 indexed listingId, uint256 newPrice, uint256 newAmount);
    event MarketplaceFeeUpdated(uint256 newFee);
    event PropertyRegistryAddressUpdated(address newAddress);
    
    constructor() Ownable(msg.sender) {}
    
    modifier onlyPropertyOwner(uint256 propertyId) {
        // This would need to be implemented based on your PropertyRegistry contract
        // For now, we'll skip this check
        _;
    }
    
    modifier onlyListingOwner(uint256 listingId) {
        require(_marketListings[listingId].seller == msg.sender, "Not listing owner");
        _;
    }
    
    modifier listingExists(uint256 listingId) {
        require(_marketListings[listingId].listingId != 0, "Listing does not exist");
        _;
    }
    
    modifier listingActive(uint256 listingId) {
        require(_marketListings[listingId].isActive, "Listing not active");
        require(block.timestamp <= _marketListings[listingId].expiresAt, "Listing expired");
        _;
    }
    
    /**
     * @dev Set the property registry address
     */
    function setPropertyRegistryAddress(address _address) external onlyOwner {
        require(_address != address(0), "Invalid address");
        propertyRegistryAddress = _address;
        emit PropertyRegistryAddressUpdated(_address);
    }
    
    /**
     * @dev List a property for sale
     */
    function listProperty(
        uint256 propertyId,
        uint256 price,
        ListingType listingType,
        uint256 amount
    ) external {
        require(price > 0, "Price must be greater than 0");
        require(propertyRegistryAddress != address(0), "Property registry not set");
        
        if (listingType == ListingType.FULL_PROPERTY) {
            require(amount == 0, "Amount should be 0 for full property");
        } else {
            require(amount > 0, "Amount must be greater than 0 for fractional tokens");
        }
        
        _listingIdCounter++;
        uint256 listingId = _listingIdCounter;
        
        _marketListings[listingId] = MarketListing({
            listingId: listingId,
            propertyId: propertyId,
            seller: msg.sender,
            price: price,
            isActive: true,
            createdAt: block.timestamp,
            expiresAt: block.timestamp + 30 days, // 30 day listing
            listingType: listingType,
            amount: amount
        });
        
        _propertyListings[propertyId].push(listingId);
        _activeListings.push(listingId);
        
        emit PropertyListed(listingId, propertyId, msg.sender, price, listingType, amount);
    }
    
    /**
     * @dev Buy a listed property
     */
    function buyProperty(uint256 listingId) external payable nonReentrant {
        MarketListing storage listing = _marketListings[listingId];
        require(listing.listingId != 0, "Listing does not exist");
        require(listing.isActive, "Listing not active");
        require(block.timestamp <= listing.expiresAt, "Listing expired");
        require(msg.sender != listing.seller, "Cannot buy your own listing");
        require(msg.value == listing.price, "Incorrect payment amount");
        
        address seller = listing.seller;
        uint256 price = listing.price;
        
        // Calculate fees
        uint256 feeAmount = (price * marketplaceFee) / FEE_DENOMINATOR;
        uint256 sellerAmount = price - feeAmount;
        
        // For now, we'll just handle the payment transfer
        // In a full implementation, you'd also transfer the property/tokens
        
        // Clear listing
        listing.isActive = false;
        _removeListing(listingId);
        
        // Transfer payments
        payable(seller).transfer(sellerAmount);
        payable(owner()).transfer(feeAmount);
        
        emit PropertySold(listingId, listing.propertyId, seller, msg.sender, price);
    }
    
    /**
     * @dev Cancel a listing
     */
    function cancelListing(uint256 listingId) external listingExists(listingId) onlyListingOwner(listingId) {
        MarketListing storage listing = _marketListings[listingId];
        require(listing.isActive, "Listing not active");
        
        listing.isActive = false;
        _removeListing(listingId);
        
        emit ListingCancelled(listingId, msg.sender);
    }
    
    /**
     * @dev Update listing price and amount
     */
    function updateListing(
        uint256 listingId, 
        uint256 newPrice, 
        uint256 newAmount
    ) external listingExists(listingId) onlyListingOwner(listingId) {
        MarketListing storage listing = _marketListings[listingId];
        require(listing.isActive, "Listing not active");
        require(newPrice > 0, "Price must be greater than 0");
        
        if (listing.listingType == ListingType.FRACTIONAL_TOKENS) {
            require(newAmount > 0, "Amount must be greater than 0 for fractional tokens");
        }
        
        listing.price = newPrice;
        listing.amount = newAmount;
        
        emit ListingUpdated(listingId, newPrice, newAmount);
    }
    
    /**
     * @dev Update marketplace fee (only owner)
     */
    function updateMarketplaceFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee cannot exceed 10%");
        marketplaceFee = newFee;
        emit MarketplaceFeeUpdated(newFee);
    }
    
    /**
     * @dev Get listing information
     */
    function getListing(uint256 listingId) external view returns (MarketListing memory) {
        return _marketListings[listingId];
    }
    
    /**
     * @dev Get all listings for a property
     */
    function getPropertyListings(uint256 propertyId) external view returns (uint256[] memory) {
        return _propertyListings[propertyId];
    }
    
    /**
     * @dev Get all active listings
     */
    function getActiveListings() external view returns (uint256[] memory) {
        return _activeListings;
    }
    
    /**
     * @dev Get listing count
     */
    function getListingCount() external view returns (uint256) {
        return _listingIdCounter;
    }
    
    /**
     * @dev Check if a property is listed
     */
    function isPropertyListed(uint256 propertyId) external view returns (bool) {
        uint256[] memory listings = _propertyListings[propertyId];
        for (uint256 i = 0; i < listings.length; i++) {
            if (_marketListings[listings[i]].isActive) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @dev Remove listing from active list
     */
    function _removeListing(uint256 listingId) private {
        // Remove from active listings
        for (uint256 i = 0; i < _activeListings.length; i++) {
            if (_activeListings[i] == listingId) {
                _activeListings[i] = _activeListings[_activeListings.length - 1];
                _activeListings.pop();
                break;
            }
        }
        
        // Remove from property listings
        uint256 propertyId = _marketListings[listingId].propertyId;
        uint256[] storage propertyListings = _propertyListings[propertyId];
        for (uint256 i = 0; i < propertyListings.length; i++) {
            if (propertyListings[i] == listingId) {
                propertyListings[i] = propertyListings[propertyListings.length - 1];
                propertyListings.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Withdraw marketplace fees (only owner)
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        payable(owner()).transfer(balance);
    }
} 