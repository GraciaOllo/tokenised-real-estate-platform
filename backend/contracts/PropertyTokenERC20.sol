// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PropertyTokenERC20
 * @dev ERC-20 token representing fractional ownership of a property
 * Each property can have its own ERC-20 token contract for fractionalization
 */
contract PropertyTokenERC20 is ERC20, Ownable {
    // Property details
    string public propertyId;
    uint256 public propertyValuation;
    uint256 public totalShares;
    uint256 public sharePrice;
    
    // Rent distribution
    uint256 public totalRentCollected;
    uint256 public lastDistributionBlock;
    
    // Events
    event SharesMinted(address indexed to, uint256 amount, uint256 sharePrice);
    event SharesBurned(address indexed from, uint256 amount);
    event RentDistributed(uint256 totalAmount, uint256 timestamp);
    event SharePriceUpdated(uint256 newPrice);
    
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _propertyId,
        uint256 _propertyValuation,
        uint256 _totalShares,
        uint256 _sharePrice
    ) ERC20(_name, _symbol) Ownable(msg.sender) {
        propertyId = _propertyId;
        propertyValuation = _propertyValuation;
        totalShares = _totalShares;
        sharePrice = _sharePrice;
        lastDistributionBlock = block.number;
    }
    
    /**
     * @dev Mint shares to an address (only owner can mint initially)
     */
    function mintShares(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be greater than 0");
        require(totalSupply() + amount <= totalShares, "Exceeds total shares");
        
        _mint(to, amount);
        emit SharesMinted(to, amount, sharePrice);
    }
    
    /**
     * @dev Burn shares from an address
     */
    function burnShares(address from, uint256 amount) external onlyOwner {
        require(from != address(0), "Invalid address");
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(from) >= amount, "Insufficient balance");
        
        _burn(from, amount);
        emit SharesBurned(from, amount);
    }
    
    /**
     * @dev Distribute rent to all token holders proportionally
     */
    function distributeRent() external payable onlyOwner {
        require(msg.value > 0, "No rent to distribute");
        require(totalSupply() > 0, "No shares minted");
        
        totalRentCollected += msg.value;
        lastDistributionBlock = block.number;
        
        emit RentDistributed(msg.value, block.timestamp);
    }
    
    /**
     * @dev Update share price (only owner)
     */
    function updateSharePrice(uint256 newPrice) external onlyOwner {
        require(newPrice > 0, "Price must be greater than 0");
        sharePrice = newPrice;
        emit SharePriceUpdated(newPrice);
    }
    
    /**
     * @dev Get property information
     */
    function getPropertyInfo() external view returns (
        string memory _propertyId,
        uint256 _propertyValuation,
        uint256 _totalShares,
        uint256 _sharePrice,
        uint256 _totalRentCollected,
        uint256 _lastDistributionBlock
    ) {
        return (
            propertyId,
            propertyValuation,
            totalShares,
            sharePrice,
            totalRentCollected,
            lastDistributionBlock
        );
    }
} 