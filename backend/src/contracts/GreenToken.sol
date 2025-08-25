// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GreenToken is ERC20, Ownable {
    uint256 public totalRent;
    mapping(address => uint256) public investorList;
    address[] public investors;

    event RentDeposited(address indexed from, uint256 amount);
    event RentDistributed(uint256 totalRent);

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    function depositRent() external payable onlyOwner {
        require(msg.value > 0, "No rent sent");
        totalRent += msg.value;
        emit RentDeposited(msg.sender, msg.value);
    }

    function distributeRent() external onlyOwner {
        require(totalRent > 0, "No rent to distribute");
        uint256 supply = totalSupply();
        for (uint256 i = 0; i < investors.length; i++) {
            address investor = investors[i];
            uint256 share = (balanceOf(investor) * totalRent) / supply;
            if (share > 0) {
                payable(investor).transfer(share);
            }
        }
        emit RentDistributed(totalRent);
        totalRent = 0;
    }

    function _afterTokenTransfer(address from, address to, uint256 amount) internal override {
        if (balanceOf(to) > 0 && investorList[to] == 0) {
            investors.push(to);
            investorList[to] = investors.length;
        }
    }

    receive() external payable {
        depositRent();
    }
}