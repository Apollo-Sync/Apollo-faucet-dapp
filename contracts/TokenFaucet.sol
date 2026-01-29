// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenFaucet is Ownable {
    ERC20 public token;
    uint256 public amount = 100 * 10**18; // 100 APT mỗi lần (18 decimals)
    uint256 public waitTime = 1 days;     // cooldown 1 ngày

    mapping(address => uint256) public lastRequest;

    // Event cũ (giữ nguyên)
    event TokensRequested(address indexed user, uint256 amount);

    // Event mới - dùng cho frontend hiển thị danh sách claim real-time
    event TokensClaimed(
        address indexed claimant,
        uint256 amount,
        uint256 timestamp
    );

    constructor(address _token) Ownable(msg.sender) {
        token = ERC20(_token);
    }

    function requestTokens() external {
        require(block.timestamp >= lastRequest[msg.sender] + waitTime, "Chua du 24h");
        require(token.balanceOf(address(this)) >= amount, "Faucet het token");

        lastRequest[msg.sender] = block.timestamp;
        token.transfer(msg.sender, amount);

        // Emit cả hai event (cũ + mới)
        emit TokensRequested(msg.sender, amount);
        emit TokensClaimed(msg.sender, amount, block.timestamp);
    }

    function getRemainingTime(address user) external view returns (uint256) {
        uint256 last = lastRequest[user];
        if (last == 0) {
            return 0; // chưa claim bao giờ → claim được ngay
        }
        uint256 endTime = last + waitTime;
        if (block.timestamp >= endTime) {
            return 0;
        }
        return endTime - block.timestamp;
    }

    // Owner có thể nạp thêm token vào faucet
    function fundFaucet(uint256 _amount) external onlyOwner {
        token.transferFrom(msg.sender, address(this), _amount);
    }

    // Owner rút token nếu cần
    function withdraw(uint256 _amount) external onlyOwner {
        token.transfer(owner(), _amount);
    }
}
