// ABI cho Faucet (giữ nguyên từ gốc, áp dụng cho cả APT Faucet và APX Faucet)
export const faucetABI = [
  "function requestTokens() external",
  "function amount() view returns (uint256)",
  "function waitTime() view returns (uint256)",
  "event TokensRequested(address indexed user, uint256 amount)"
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
    address: "0xbf203CBCc6B24315D163C2564d7c2faD6C35bc14",
    symbol: "APT",
    name: "Apollo Token"  // Có thể update nếu tên contract khác
  },
  faucet: {
    address: "0x0D88C8230f780D71c0888d3aDA08dc0727569DEC",
    dripAmount: "100",     // Update theo amount() trong contract nếu khác
    waitTime: "86400"      // 24 hours in seconds (có thể query từ waitTime())
  }
};

// ────────────────────────────────────────────────
// Config cho APX
// ────────────────────────────────────────────────
export const APX = {
  token: {
    address: "0x16f81f1e3E727943bc6090cb06FC03054F91641d",
    symbol: "APX",
    name: "APX Token"      // Update nếu tên contract khác
  },
  faucet: {
    address: "0xc9B4C152ec807f78cdb0903E932cb5b9d8bBE417",
    dripAmount: "100",     // Update theo amount() trong contract APXFaucet
    waitTime: "86400"      // 24 hours, adjust nếu khác
  }
};

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
