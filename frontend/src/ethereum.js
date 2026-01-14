export const faucetABI = [
  "function requestTokens() external",
  "function amount() view returns (uint256)",
  "function waitTime() view returns (uint256)",
  "event TokensRequested(address indexed user, uint256 amount)"
];

// === Thêm cho ApolloToken (ERC-20) ===
export const TOKEN_ADDRESS = "0xE7230416f9365b9429db23142A654f5Fb982E4c7";

export const tokenABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];
