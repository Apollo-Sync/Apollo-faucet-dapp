// ABI cho Faucet (giữ nguyên từ gốc, áp dụng cho cả APT Faucet và APX Faucet)
// Đã bổ sung event TokensClaimed mới để frontend query và listen real-time
export const faucetABI = [
  "function requestTokens() external",
  "function amount() view returns (uint256)",
  "function waitTime() view returns (uint256)",
  "function getRemainingTime(address user) view returns (uint256)",
  "event TokensRequested(address indexed user, uint256 amount)",
  "event TokensClaimed(address indexed claimant, uint256 amount, uint256 timestamp)"
];

// ABI cho Token (ERC-20, áp dụng cho cả APT và APX vì cùng chuẩn)
export const tokenABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)"
  // Nếu cần thêm function khác (như transfer), bạn có thể bổ sung sau
];

// ────────────────────────────────────────────────
// Config cho APT (ApolloToken & Faucet)
// ────────────────────────────────────────────────
export const APT = {
  token: {
    address: "0xCc4ff3BF08cD1C7C754cb052a30B7914C7279b7F",
    symbol: "APT",
    name: "Apollo Token"  // Có thể update nếu tên contract khác
  },
  faucet: {
    address: "0x01B91EfFb359eC049CD59a7fA0Bd5C9ca8678FF5",
    dripAmount: "100",     // Update theo amount() trong contract nếu khác
    waitTime: "86400"      // 24 hours in seconds (có thể query từ waitTime())
  }
};

// ────────────────────────────────────────────────
// Config cho APX
// ────────────────────────────────────────────────
export const APX = {
  token: {
    address: "0x32B9eFAbbF7b5841b4031D1267855dC548106eaB",
    symbol: "APX",
    name: "APX Token"      // Update nếu tên contract khác
  },
  faucet: {
    address: "0x9e51EAE6852ba0860958A3947104dc9FB2aC3532",
    dripAmount: "100",     // Update theo amount() trong contract APXFaucet
    waitTime: "86400"      // 24 hours, adjust nếu khác
  }
};

// Export trực tiếp 2 địa chỉ faucet để khớp với import trong RecentClaimsList.jsx
// (giải quyết lỗi: 'faucetAddressAPT' is not exported)
export const faucetAddressAPT = APT.faucet.address;
export const faucetAddressAPX = APX.faucet.address;

// Export ABI dưới tên faucetAbi nếu component đang import tên này
// (nếu RecentClaimsList.jsx import faucetAbi thay vì faucetABI)
export const faucetAbi = faucetABI;  // alias để tương thích

// Helper để dễ lấy config theo loại token (rất hữu ích khi có 2 nút riêng)
export const getTokenConfig = (tokenType) => {
  if (tokenType === 'APT') return APT;
  if (tokenType === 'APX') return APX;
  throw new Error(`Unknown token type: ${tokenType}`);
};

export const getFaucetAddress = (tokenType) => {
  return getTokenConfig(tokenType).faucet.address;
};

export const getTokenAddress = (tokenType) => {
  return getTokenConfig(tokenType).token.address;
};