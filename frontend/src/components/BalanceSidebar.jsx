// components/BalanceSidebar.jsx
import React from 'react';
import './BalanceSidebar.css';

function BalanceSidebar({ ethBalance, aptTokenBalance, apxTokenBalance }) {
  return (
    <div className="balance-sidebar neon-text">
      <div className="balance-title">Your Balance</div>
      <div className="balance-items">
        <div>ETH: {ethBalance}</div>
        <div>APT: {aptTokenBalance}</div>
        <div>APX: {apxTokenBalance}</div>
      </div>
    </div>
  );
}

export default BalanceSidebar;
