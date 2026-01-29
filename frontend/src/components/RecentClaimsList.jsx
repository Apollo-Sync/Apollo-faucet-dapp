import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { faucetAbi, faucetAddressAPT, faucetAddressAPX } from '../ethereum'; // import từ ethereum.js
import './RecentClaimsList.css';

const RecentClaimsList = () => {
  const [claims, setClaims] = useState([]); // [{address, amount, timestamp, token}, ...]

  useEffect(() => {
    const provider = new ethers.BrowserProvider(window.ethereum);	
    const aptFaucet = new ethers.Contract(faucetAddressAPT, faucetAbi, provider);
    const apxFaucet = new ethers.Contract(faucetAddressAPX, faucetAbi, provider);

    const fetchPastClaims = async () => {
      try {
        // Lấy 50 event gần nhất (đủ để lọc 10 mới nhất)
        const filterAPT = aptFaucet.filters.TokensClaimed();
        const filterAPX = apxFaucet.filters.TokensClaimed();

        const pastAPT = await aptFaucet.queryFilter(filterAPT, -5000); // ~5000 blocks gần đây
        const pastAPX = await apxFaucet.queryFilter(filterAPX, -5000);

        const allEvents = [...pastAPT, ...pastAPX]
          .map(log => {
            const { claimant, amount, timestamp } = log.args;
            return {
              address: claimant,
              amount: ethers.formatEther(amount),
              timestamp: Number(timestamp),
              token: log.address.toLowerCase() === faucetAddressAPT.toLowerCase() ? 'APT' : 'APX',
              txHash: log.transactionHash,
            };
          })
          .sort((a, b) => b.timestamp - a.timestamp) // mới nhất trước
          .slice(0, 10);

        setClaims(allEvents);
      } catch (err) {
        console.error('Error fetching past claims:', err);
      }
    };

    fetchPastClaims();

    // Listen real-time
    const handleClaim = (claimant, amount, timestamp, token) => {
      const newClaim = {
        address: claimant,
        amount: ethers.formatEther(amount),
        timestamp: Number(timestamp),
        token,
        txHash: '', // có thể lấy từ tx nếu cần
      };
      setClaims(prev => [newClaim, ...prev].slice(0, 10)); // thêm đầu, giữ tối đa 10
    };

    aptFaucet.on('TokensClaimed', (claimant, amount, timestamp) =>
      handleClaim(claimant, amount, timestamp, 'APT')
    );
    apxFaucet.on('TokensClaimed', (claimant, amount, timestamp) =>
      handleClaim(claimant, amount, timestamp, 'APX')
    );

    return () => {
      aptFaucet.removeAllListeners();
      apxFaucet.removeAllListeners();
    };
  }, []);

  return (
    <div className="recent-claims-container">
      <h3 style={{ color: '#00ffff', marginBottom: '10px' }}>Recent Claims (Last 10)</h3>
      <ul className="claims-list">
        {claims.length === 0 ? (
          <li>Chưa có claim nào...</li>
        ) : (
          claims.map((claim, idx) => (
            <li key={idx} style={{ color: '#00ff9d', fontSize: '14px' }}>
              {claim.address.slice(0, 6)}...{claim.address.slice(-4)} claimed {claim.amount} {claim.token}
              <br />
              <small style={{ color: '#aaa' }}>
                {new Date(claim.timestamp * 1000).toLocaleString()}
              </small>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default RecentClaimsList;
