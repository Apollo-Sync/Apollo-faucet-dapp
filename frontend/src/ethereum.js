export const faucetABI = [
  "function requestTokens() external",
  "function amount() view returns (uint256)",
  "function waitTime() view returns (uint256)",
  "event TokensRequested(address indexed user, uint256 amount)"
];

// === Thêm cho ApolloToken (ERC-20) ===
export const TOKEN_ADDRESS = "0x5B0Ca393d67797Bc7130ce54f038304cfA63CA8C";

export const tokenABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];
