// components/Header.jsx
import React from 'react';
import './Header.css';

function Header({ account, onConnect }) {
  return (
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
            onClick={onConnect}
          >
            Connect EVM Wallet
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
