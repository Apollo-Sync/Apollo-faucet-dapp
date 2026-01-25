// components/FaucetCard.jsx
import React from 'react';

function FaucetCard({
  selectedToken,
  onSelectToken,
  canClaim,
  timeLeft,
  formatTime,
  getTokenSymbol,
  onRequest,
  status,
  account
}) {
  return (
    <div className="card">
      <h1 className="neon-text">Apollo Token Faucet (Sepolia)</h1>

      {account && (
        <div className="token-selector neon-text">
          <label>Select Token: </label>
          <select 
            value={selectedToken} 
            onChange={(e) => onSelectToken(e.target.value)}
            className="neon-select"
          >
            <option value="APT">APT</option>
            <option value="APX">APX</option>
          </select>
        </div>
      )}

      {account && canClaim ? (
        <button 
          className="neon-button neon-text request-btn" 
          onClick={onRequest}
        >
          Request 100 {getTokenSymbol()}
        </button>
      ) : account && !canClaim ? (
        <div className="cooldown-section neon-text">
          <p>Đã claim {getTokenSymbol()}, vui lòng chờ 24h để claim tiếp.</p>
          <p>Thời gian còn lại: {formatTime(timeLeft)}</p>
        </div>
      ) : null}

      {status && <p className="status neon-text">{status}</p>}
    </div>
  );
}

export default FaucetCard;
