// import { useState } from 'react'
import './App.css'
import { useIntMaxClient } from './hooks/useIntMaxClient'
import { LoginButton } from './components/Auth/LoginButton'
import { LogoutButton } from './components/Auth/LogoutButton'
import { PrivateKeyDisplay } from './components/Auth/PrivateKeyDisplay'
import { BalanceDisplay } from './components/Wallet/BalanceDisplay'
import { DepositForm } from './components/Wallet/DepositForm'
import { WithdrawForm } from './components/Wallet/WithdrawalForm'
import { TransactionHistory } from './components/Wallet/TrnasactionHistory'
import { Header } from './components/Layout/Header'
import { LoadingSpinner } from './components/Common/LoadingSpinner'
import { TransferForm } from './components/Wallet/TransferForm'
import { QuickTransferButton } from './components/Wallet/QuickTransferButton'

function App() {
  const { 
    client, 
    isLoggedIn, 
    loading, 
    error,
    initializeClient, 
    login, 
    logout 
  } = useIntMaxClient()

  if (loading) {
    return (
      <div className="app-loading">
        <LoadingSpinner />
        <p>Initializing IntMax2 Client...</p>
      </div>
    )
  }

  return (
    <div className="app">
      <Header />
      
      <main className="main-content">
        {error && (
          <div className="error-banner">
            <p>Error: {error}</p>
          </div>
        )}

        {!client ? (
          <section className="init-section">
            <div className="card">
              <h2>Welcome to IntMax2 Wallet</h2>
              <p>Initialize the client to get started</p>
              <button 
                onClick={initializeClient} 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Initializing...' : 'Initialize Client'}
              </button>
            </div>
          </section>
        ) : !isLoggedIn ? (
          <section className="login-section">
            <div className="card">
              <h2>Login to Your Wallet</h2>
              <p>Connect your IntMax2 wallet to continue</p>
              <LoginButton onLogin={login} loading={loading} />
            </div>
          </section>
        ) : (
          <section className="wallet-section">
            <div className="wallet-header">
              <div className="wallet-info">
                <h2>Your IntMax2 Wallet</h2>
                <p className="wallet-address">
                  Address: <code>{client.address}</code>
                </p>
              </div>
              <div className="wallet-actions">
                <PrivateKeyDisplay client={client} />
                <LogoutButton onLogout={logout} />
              </div>
            </div>
            
            <div className="wallet-grid">
              <div className="grid-item">
                <BalanceDisplay client={client} />
              </div>
              
              <div className="grid-item">
                <DepositForm client={client} />
              </div>
              <div className="grid-item">
                <QuickTransferButton client={client} />
              </div>
              <div className="grid-item">
                <TransferForm client={client} />
              </div>
              <div className="grid-item">
                <WithdrawForm client={client} />
              </div>
              
              <div className="grid-item grid-full">
                <TransactionHistory client={client} />
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
