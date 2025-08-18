import React from 'react'

export const Header: React.FC = () => {
  const networkName = import.meta.env.VITE_INTMAX_ENV || 'Unknown Network';
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="app-title">IntMax2 Wallet</h1>
          <span className="app-subtitle">{networkName}</span>
        </div>
      </div>
    </header>
  )
}
