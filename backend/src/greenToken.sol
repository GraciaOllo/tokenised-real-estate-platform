// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GreenToken is ERC20, Ownable {
    mapping(address => uint256) public investorShares;
    uint256 public totalRent;

    constructor(string memory propertyName, string memory symbol, uint256 totalSupply) ERC20(propertyName, symbol) {
        _mint(msg.sender, totalSupply * 10**decimals());
    }

    function buyTokens(address buyer, uint256 amount) external onlyOwner {
        _transfer(owner(), buyer, amount);
        investorShares[buyer] += amount;
    }

    function receiveRent() external payable onlyOwner {
        totalRent += msg.value;
    }

    function distributeRent() external onlyOwner {
        uint256 supply = totalSupply();
        for (uint256 i = 0; i < getInvestorCount(); i++) {
            address investor = investorAt(i);
            uint256 share = (balanceOf(investor) * totalRent) / supply;
            payable(investor).transfer(share);
        }
        totalRent = 0;
    }

    address[] public investors;

    function investorAt(uint256 index) public view returns (address) {
        return investors[index];
    }

    function getInvestorCount() public view returns (uint256) {
        return investors.length;
    }

    function trackInvestor(address investor) external onlyOwner {
        if (balanceOf(investor) > 0) {
            investors.push(investor);
        }
    }
}