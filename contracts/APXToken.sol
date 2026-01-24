// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract APXToken is ERC20, Ownable {
    constructor() ERC20("APX Token", "APX") Ownable(msg.sender) {
        _mint(msg.sender, 1_000_000 * 10**decimals()); // mint 1 triệu token cho owner
    }

    // Cho phép owner mint thêm nếu cần
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
