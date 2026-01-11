import React, { useState } from 'react';
import { ethers } from 'ethers';
import { faucetABI } from './ethereum';

import './App.css';  // <-- Thêm import này

const FAUCET_ADDRESS = "0x664224E312D5e3Cfd184764D895e37fbc21863f3";

function App() {
  const [account, setAccount] = useState('');
  const [status, setStatus] = useState('');

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

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const faucet = new ethers.Contract(FAUCET_ADDRESS, faucetABI, signer);

    try {
      setStatus("Đang gửi transaction...");
      const tx = await faucet.requestTokens();
      await tx.wait();
      setStatus("Thành công! Nhận được 100 APT");
    } catch (err) {
      setStatus("Lỗi: " + (err.reason || err.message));
    }
  }

  return (
    <div className="card">  {/* Card glassmorphic */}
      <h1 className="neon-text">Apollo Token Faucet (Sepolia)</h1>  {/* Title glow */}

      {!account ? (
        <button 
          className="neon-button neon-text" 
          onClick={connectWallet}
        >
          Connect EVM Wallet
        </button>
      ) : (
        <p className="status">
          Connected: {account.slice(0,6)}...{account.slice(-4)}
        </p>
      )}

      <button 
        className="neon-button neon-text" 
        onClick={requestTokens} 
        disabled={!account}
      >
        Request 100 APT
      </button>

      {status && <p className="status">{status}</p>}
    </div>
  );
}

export default App;
