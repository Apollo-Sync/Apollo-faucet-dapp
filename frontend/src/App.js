import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { faucetABI, tokenABI, APT, APX, getFaucetAddress, getTokenAddress } from './ethereum';

import './App.css';

function App() {
  const [account, setAccount] = useState('');
  const [status, setStatus] = useState('');
  const [ethBalance, setEthBalance] = useState('0.00');
  const [aptTokenBalance, setAptTokenBalance] = useState('0.00');
  const [apxTokenBalance, setApxTokenBalance] = useState('0.00');
  const [selectedToken, setSelectedToken] = useState('APT'); // 'APT' hoặc 'APX'
  
  // Cooldown riêng cho từng token
  const [canClaimAPT, setCanClaimAPT] = useState(true);
  const [canClaimAPX, setCanClaimAPX] = useState(true);
  const [timeLeftAPT, setTimeLeftAPT] = useState(0);
  const [timeLeftAPX, setTimeLeftAPX] = useState(0);
  const [lastClaimTimeAPT, setLastClaimTimeAPT] = useState(0);
  const [lastClaimTimeAPX, setLastClaimTimeAPX] = useState(0);

  const COOLDOWN_SECONDS = 24 * 60 * 60; // 24 giờ

  async function connectWallet() {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      
      // Switch sang Sepolia nếu cần (tự động khi connect)
      try {
        const network = await provider.getNetwork();
        if (Number(network.chainId) !== 11155111) {
          await switchToSepolia();
        }
      } catch (err) {
        console.error("Auto-switch network error:", err);
      }
    } else {
      alert("Please install EVM wallet!");
    }
  }

  async function switchToSepolia() {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }], // Sepolia chainId hex
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0xaa36a7",
                chainName: "Sepolia Test Network",
                nativeCurrency: {
                  name: "ETH",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: ["https://rpc.sepolia.org"],
                blockExplorerUrls: ["https://sepolia.etherscan.io"],
              },
            ],
          });
        } catch (addError) {
          console.error("Add Sepolia error:", addError);
          // Không alert để giữ sạch, chỉ log
        }
      } else {
        console.error("Switch error:", switchError);
      }
    }
  }

  async function requestTokens(tokenType) {
    if (!account) return alert("Connect wallet trước");
    
    const canClaim = tokenType === 'APT' ? canClaimAPT : canClaimAPX;
    if (!canClaim) return;

    // Check và switch sang Sepolia nếu cần (không thông báo)
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        if (Number(network.chainId) !== 11155111) {
          await switchToSepolia();
          // Đợi ngắn để MetaMask update network
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      } catch (err) {
        console.error("Error checking/switching network:", err);
        // Không alert, cứ tiếp tục (nếu switch fail thì tx sẽ fail tự nhiên)
      }
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const faucetAddress = getFaucetAddress(tokenType);
    const faucet = new ethers.Contract(faucetAddress, faucetABI, signer);

    try {
      setStatus(`Đang gửi transaction cho ${tokenType}...`);
      const tx = await faucet.requestTokens();
      await tx.wait();
      
      const tokenConfig = tokenType === 'APT' ? APT : APX;
      setStatus(`Thành công! Nhận được 100 ${tokenConfig.token.symbol}`);

      // Lưu thời gian claim mới và bắt đầu cooldown cho token này
      const now = Math.floor(Date.now() / 1000);
      const key = `lastClaimTime${tokenType}`;
      localStorage.setItem(key, now.toString());
      
      if (tokenType === 'APT') {
        setLastClaimTimeAPT(now);
        setCanClaimAPT(false);
        setTimeLeftAPT(COOLDOWN_SECONDS);
      } else {
        setLastClaimTimeAPX(now);
        setCanClaimAPX(false);
        setTimeLeftAPX(COOLDOWN_SECONDS);
      }

      // Clear status sau 5 giây
      setTimeout(() => setStatus(''), 5000);
    } catch (err) {
      setStatus("Lỗi: " + (err.reason || err.message));
    }
  }

  async function fetchBalances() {
    if (!account || !window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);

      const ethBal = await provider.getBalance(account);
      setEthBalance(ethers.formatEther(ethBal).slice(0, 6));

      // Fetch APT balance
      const aptTokenContract = new ethers.Contract(getTokenAddress('APT'), tokenABI, provider);
      const aptBalRaw = await aptTokenContract.balanceOf(account);
      const aptDecimals = await aptTokenContract.decimals();
      setAptTokenBalance(ethers.formatUnits(aptBalRaw, aptDecimals).slice(0, 6));

      // Fetch APX balance
      const apxTokenContract = new ethers.Contract(getTokenAddress('APX'), tokenABI, provider);
      const apxBalRaw = await apxTokenContract.balanceOf(account);
      const apxDecimals = await apxTokenContract.decimals();
      setApxTokenBalance(ethers.formatUnits(apxBalRaw, apxDecimals).slice(0, 6));
    } catch (err) {
      console.error("Lỗi fetch balance:", err);
      setEthBalance("Error");
      setAptTokenBalance("Error");
      setApxTokenBalance("Error");
    }
  }

  // useEffect load cooldown APT
  useEffect(() => {
    const storedTimeAPT = localStorage.getItem("lastClaimTimeAPT");
    if (storedTimeAPT) {
      const parsed = parseInt(storedTimeAPT);
      setLastClaimTimeAPT(parsed);
      const now = Math.floor(Date.now() / 1000);
      const secondsPassed = now - parsed;
      if (secondsPassed < COOLDOWN_SECONDS) {
        setCanClaimAPT(false);
        setTimeLeftAPT(COOLDOWN_SECONDS - secondsPassed);
      }
    }

    // Load cooldown APX
    const storedTimeAPX = localStorage.getItem("lastClaimTimeAPX");
    if (storedTimeAPX) {
      const parsed = parseInt(storedTimeAPX);
      setLastClaimTimeAPX(parsed);
      const now = Math.floor(Date.now() / 1000);
      const secondsPassed = now - parsed;
      if (secondsPassed < COOLDOWN_SECONDS) {
        setCanClaimAPX(false);
        setTimeLeftAPX(COOLDOWN_SECONDS - secondsPassed);
      }
    }
  }, []);

  // useEffect timer APT
  useEffect(() => {
    if (!canClaimAPT && timeLeftAPT > 0) {
      const timer = setInterval(() => {
        setTimeLeftAPT((prev) => {
          if (prev <= 1) {
            setCanClaimAPT(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [canClaimAPT, timeLeftAPT]);

  // useEffect timer APX
  useEffect(() => {
    if (!canClaimAPX && timeLeftAPX > 0) {
      const timer = setInterval(() => {
        setTimeLeftAPX((prev) => {
          if (prev <= 1) {
            setCanClaimAPX(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [canClaimAPX, timeLeftAPX]);

  useEffect(() => {
    if (account) {
      fetchBalances();
      const interval = setInterval(fetchBalances, 10000);
      return () => clearInterval(interval);
    }
  }, [account]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Helper lấy canClaim và timeLeft theo selectedToken
  const getCanClaim = () => selectedToken === 'APT' ? canClaimAPT : canClaimAPX;
  const getTimeLeft = () => selectedToken === 'APT' ? timeLeftAPT : timeLeftAPX;

  // Helper lấy token balance theo selectedToken
  const getTokenBalance = () => selectedToken === 'APT' ? aptTokenBalance : apxTokenBalance;
  const getTokenSymbol = () => selectedToken === 'APT' ? 'APT' : 'APX';

  return (
    <div className="app-container">
      {/* Header giữ nguyên: logo + địa chỉ ví */}
      <header className="header">
        <div className="header-left">
          <h2 className="neon-text-small">Apollo Faucet</h2>
        </div>
        <div className="wallet-section">
          {account ? (
            <span className="connected neon-text">
              {account.slice(0, 6)}...{account.slice(-4)}
            </span>
          ) : (
            <button 
              className="neon-button neon-text connect-btn" 
              onClick={connectWallet}
            >
              Connect EVM Wallet
            </button>
          )}
        </div>
      </header>

      {/* Main content - card chính giờ chứa cả balances và selector */}
      <main className="main-content">
        <div className="card">
          <h1 className="neon-text">Apollo Token Faucet (Sepolia)</h1>

          {/* Token Selector mới - dropdown để chọn APT/APX */}
          {account && (
            <div className="token-selector neon-text">
              <label>Select Token: </label>
              <select 
                value={selectedToken} 
                onChange={(e) => setSelectedToken(e.target.value)}
                className="neon-select"
              >
                <option value="APT">APT</option>
                <option value="APX">APX</option>
              </select>
            </div>
          )}

          {/* Mục Your Balance cập nhật - hiển thị cả APT và APX */}
          {account && (
            <div className="balance-section neon-text">
              <div className="balance-title">Your Balance</div>
              <div className="balance-items">
                <span className="balance-item eth-balance">
                  ETH: {ethBalance}
                </span>
                <span className="balance-item token-balance">
                  {getTokenSymbol()}: {getTokenBalance()}
                </span>
                {/* Hiển thị cả hai balance để user thấy rõ */}
                <span className="balance-item apt-balance">
                  APT: {aptTokenBalance}
                </span>
                <span className="balance-item apx-balance">
                  APX: {apxTokenBalance}
                </span>
              </div>
            </div>
          )}

          {account && getCanClaim() ? (
            <button 
              className="neon-button neon-text request-btn" 
              onClick={() => requestTokens(selectedToken)}
            >
              Request 100 {getTokenSymbol()}
            </button>
          ) : account && !getCanClaim() ? (
            <div className="cooldown-section neon-text">
              <p>Đã claim {getTokenSymbol()}, vui lòng chờ 24h để claim tiếp.</p>
              <p>Thời gian còn lại: {formatTime(getTimeLeft())}</p>
            </div>
          ) : null}

          {status && <p className="status neon-text">{status}</p>}
        </div>
      </main>

      {/* Footer giữ nguyên */}
      <footer className="footer">
        <div className="social-icons">
          <a href="https://x.com/Apollo_sync" target="_blank" rel="noopener noreferrer" title="X (Twitter)">
            𝕏
          </a>
          <a href="https://t.me/Apollosync" target="_blank" rel="noopener noreferrer" title="Telegram">
            ✈️
          </a>
          <a href="https://github.com/Apollo-Sync" target="_blank" rel="noopener noreferrer" title="GitHub">
            🐱
          </a>
          <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" title="Instagram">
            📸
          </a>
          <a href="https://discord.com/invite/zama" target="_blank" rel="noopener noreferrer" title="Discord">
            🎮
          </a>
          <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" title="YouTube">
            ▶️
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
