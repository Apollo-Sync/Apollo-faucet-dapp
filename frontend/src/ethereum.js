export const faucetABI = [
  "function requestTokens() external",
  "function amount() view returns (uint256)",
  "function waitTime() view returns (uint256)",
  "event TokensRequested(address indexed user, uint256 amount)"
];
