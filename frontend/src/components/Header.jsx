// frontend/src/components/Header.jsx
import React, { useState } from 'react';
import './Header.css';

function Header({ account, onConnect, onDisconnect }) {
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => setShowMenu(!showMenu);

  const handleDisconnect = () => {
    if (onDisconnect) onDisconnect();
    setShowMenu(false);
  };

  return (
    <header className="header">
      <div className="header-left">
        <h2 className="neon-text-small">Apollo Faucet</h2>
      </div>

      <div className="wallet-section">
        {account ? (
          <div className="connected-wrapper" style={{ position: 'relative' }}>
            <span 
              className="connected neon-text"
              onClick={toggleMenu}
              style={{ cursor: 'pointer' }}
            >
              {account.slice(0, 6)}...{account.slice(-4)}
            </span>

            {showMenu && (
              <div className="wallet-dropdown">
                <button 
                  className="disconnect-btn neon-text"
                  onClick={handleDisconnect}
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
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
