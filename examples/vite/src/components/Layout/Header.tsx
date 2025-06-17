import React from 'react'

export const Header: React.FC = () => {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="app-title">IntMax2 Wallet</h1>
          <span className="app-subtitle">Testnet</span>
        </div>
        <div className="header-right">
          <a 
            href="https://aquatic-paperback-675.notion.site/INTMAX-Client-SDK-Integration-Guide-208d989987db809db876ff8c79e78853" 
            target="_blank" 
            rel="noopener noreferrer"
            className="header-link"
          >
            Documentation
          </a>
        </div>
      </div>
    </header>
  )
}
