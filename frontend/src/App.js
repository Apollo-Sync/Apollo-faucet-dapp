import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { faucetABI, tokenABI, TOKEN_ADDRESS } from './ethereum';

import './App.css';

const FAUCET_ADDRESS = "0x664224E312D5e3Cfd184764D895e37fbc21863f3";

function App() {
  const [account, setAccount] = useState('');
  const [status, setStatus] = useState('');
  const [ethBalance, setEthBalance] = useState('0.00');
  const [tokenBalance, setTokenBalance] = useState('0.00');
  const [canClaim, setCanClaim] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [lastClaimTime, setLastClaimTime] = useState(0);

  const COOLDOWN_SECONDS = 24 * 60 * 60; // 24 giờ

  async function connectWallet() {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
    } else {
      alert("Please install EVM wallet!");
    }
  }

  async function requestTokens() {
    if (!account) return alert("Connect wallet trước");
    if (!canClaim) return;

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const faucet = new ethers.Contract(FAUCET_ADDRESS, faucetABI, signer);

    try {
      setStatus("Đang gửi transaction...");
      const tx = await faucet.requestTokens();
      await tx.wait();
      setStatus("Thành công! Nhận được 100 APT");

      // Lưu thời gian claim mới và bắt đầu cooldown
      const now = Math.floor(Date.now() / 1000);
      localStorage.setItem("lastClaimTime", now.toString());
      setLastClaimTime(now);
      setCanClaim(false);
      setTimeLeft(COOLDOWN_SECONDS);

      // Clear status sau 5 giây để không che countdown
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

      const tokenContract = new ethers.Contract(TOKEN_ADDRESS, tokenABI, provider);
      const tokenBalRaw = await tokenContract.balanceOf(account);
      const decimals = await tokenContract.decimals();
      setTokenBalance(ethers.formatUnits(tokenBalRaw, decimals).slice(0, 6));
    } catch (err) {
      console.error("Lỗi fetch balance:", err);
      setEthBalance("Error");
      setTokenBalance("Error");
    }
  }

  useEffect(() => {
    // Load last claim time từ localStorage
    const storedTime = localStorage.getItem("lastClaimTime");
    if (storedTime) {
      const parsed = parseInt(storedTime);
      setLastClaimTime(parsed);
      const now = Math.floor(Date.now() / 1000);
      const secondsPassed = now - parsed;
      if (secondsPassed < COOLDOWN_SECONDS) {
        setCanClaim(false);
        setTimeLeft(COOLDOWN_SECONDS - secondsPassed);
      }
    }
  }, []);

  useEffect(() => {
    if (!canClaim && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCanClaim(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [canClaim, timeLeft]);

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

      {/* Main content - card chính giờ chứa cả balances */}
      <main className="main-content">
        <div className="card">
          <h1 className="neon-text">Apollo Token Faucet (Sepolia)</h1>

          {/* Mục Your Balance mới - đặt ngay dưới tiêu đề */}
          {account && (
            <div className="balance-section neon-text">
              <div className="balance-title">Your Balance</div>
              <div className="balance-items">
                <span className="balance-item eth-balance">
                  ETH: {ethBalance}
                </span>
                <span className="balance-item token-balance">
                  APT: {tokenBalance}
                </span>
              </div>
            </div>
          )}

          {account && canClaim ? (
            <button 
              className="neon-button neon-text request-btn" 
              onClick={requestTokens}
            >
              Request 100 APT
            </button>
          ) : account && !canClaim ? (
            <div className="cooldown-section neon-text">
              <p>Đã claim, vui lòng chờ 24h để claim tiếp.</p>
              <p>Thời gian còn lại: {formatTime(timeLeft)}</p>
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
