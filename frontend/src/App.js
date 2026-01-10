import React, { useState } from 'react';
import { ethers } from 'ethers';
import { faucetABI } from './ethereum'; // sẽ tạo file này

const FAUCET_ADDRESS = "THAY_BANG_ADDRESS_FAUCET_SAU_KHI_DEPLOY";

function App() {
  const [account, setAccount] = useState('');
  const [status, setStatus] = useState('');

  async function connectWallet() {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
    } else {
      alert("Cài MetaMask!");
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
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Apollo Token Faucet (Sepolia)</h1>
      {!account ? (
        <button onClick={connectWallet}>Connect MetaMask</button>
      ) : (
        <p>Connected: {account.slice(0,6)}...{account.slice(-4)}</p>
      )}
      <br /><br />
      <button onClick={requestTokens} disabled={!account}>Request 100 APT</button>
      <p>{status}</p>
    </div>
  );
}

export default App;
