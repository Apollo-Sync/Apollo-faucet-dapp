// App.jsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { faucetABI, tokenABI, APT, APX, getFaucetAddress, getTokenAddress } from './ethereum';

import Header from './components/Header';
import BalanceSidebar from './components/BalanceSidebar';
import FaucetCard from './components/FaucetCard';
import Footer from './components/Footer';
import RecentClaimsList from './components/RecentClaimsList';

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
  function disconnectWallet() {
    setAccount('');
    // Reset balances về mặc định (tùy chọn, để UI sạch sẽ hơn)
    setEthBalance('0.00');
    setAptTokenBalance('0.00');
    setApxTokenBalance('0.00');
    // Nếu bạn muốn xóa thêm dữ liệu localStorage khác, thêm ở đây
    // Ví dụ: localStorage.removeItem('someOtherKey');
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

    // Check và switch sang Sepolia nếu cần
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        if (Number(network.chainId) !== 11155111) {
          await switchToSepolia();
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      } catch (err) {
        console.error("Error checking/switching network:", err);
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

      // Lưu thời gian claim mới và bắt đầu cooldown
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

      const aptTokenContract = new ethers.Contract(getTokenAddress('APT'), tokenABI, provider);
      const aptBalRaw = await aptTokenContract.balanceOf(account);
      const aptDecimals = await aptTokenContract.decimals();
      setAptTokenBalance(ethers.formatUnits(aptBalRaw, aptDecimals).slice(0, 6));

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

  // Load cooldown từ localStorage khi mount
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

  // Timer countdown cho APT
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

  // Timer countdown cho APX
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

  // Fetch balances khi có account + refresh mỗi 10s
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

  // Helper functions
  const getCanClaim = () => selectedToken === 'APT' ? canClaimAPT : canClaimAPX;
  const getTimeLeft = () => selectedToken === 'APT' ? timeLeftAPT : timeLeftAPX;
  const getTokenSymbol = () => selectedToken === 'APT' ? 'APT' : 'APX';

  return (
   <div className="app-container">
    <Header 
      account={account} 
      onConnect={connectWallet}
      onDisconnect={disconnectWallet}
    />

    {/* Thêm wrapper relative để absolute của list bên phải hoạt động đúng */}
    <div className="main-wrapper" style={{ position: 'relative' }}>
      <main className="main-content">
        {account && (
          <BalanceSidebar
            ethBalance={ethBalance}
            aptTokenBalance={aptTokenBalance}
            apxTokenBalance={apxTokenBalance}
          />
        )}

        <FaucetCard
          selectedToken={selectedToken}
          onSelectToken={setSelectedToken}
          canClaim={getCanClaim()}
          timeLeft={getTimeLeft()}
          formatTime={formatTime}
          getTokenSymbol={getTokenSymbol}
          onRequest={() => requestTokens(selectedToken)}
          status={status}
          account={account}
        />
      </main>

      {/* Đặt RecentClaimsList ở đây - nó sẽ absolute relative với .main-wrapper */}
      <RecentClaimsList />
     </div>

     <Footer />
   </div>
  );
}

export default App;
