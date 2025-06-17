import React, { useState } from 'react'
import { FetchWithdrawalsResponse, IntMaxClient, Transaction } from 'intmax2-client-sdk'
import { LoadingSpinner } from '../../components/Common/LoadingSpinner'
import { ErrorMessage } from '../../components/Common/ErrorMessage'

interface TransactionHistoryProps {
  client: IntMaxClient
}

interface HistoryData {
  deposits: Transaction[]
  receiveTransfers: Transaction[]
  sendTransfers: Transaction[]
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ client }) => {
  const [history, setHistory] = useState<HistoryData | null>(null)
  const [withdrawals, setWithdrawals] = useState<FetchWithdrawalsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'history' | 'withdrawals'>('history')

  const fetchHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [deposits, receiveTransfers, sendTransfers] = await Promise.all([
        client.fetchDeposits({}),
        client.fetchTransfers({}),
        client.fetchTransactions({}),
      ])
      
      setHistory({
        deposits,
        receiveTransfers,
        sendTransfers,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transaction history'
      if (errorMessage === "User data not found") {
        setError('User data not found. Please fetch token balances first.')
      } else {
        setError(errorMessage)
      }
      console.error('History fetch failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchWithdrawals = async () => {
    try {
      setLoading(true)
      setError(null)
      const withdrawalData = await client.fetchWithdrawals()
      setWithdrawals(withdrawalData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch withdrawals'
      setError(errorMessage)
      console.error('Withdrawals fetch failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const claimWithdrawals = async () => {
    if (!withdrawals || withdrawals.need_claim.length === 0) return
    
    try {
      setLoading(true)
      setError(null)
      const result = await client.claimWithdrawal(withdrawals.need_claim)
      console.log('Claim result:', result)
      
      // Refresh withdrawals after claiming
      await fetchWithdrawals()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to claim withdrawals'
      setError(errorMessage)
      console.error('Claim failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const renderTransactionItem = (tx: Transaction, index: number, type: string) => (
    <div key={`${type}-${index}`} className="transaction-item">
      <div className="transaction-header">
        <span className="transaction-type">{type}</span>
        <span className="transaction-index">#{index}</span>
      </div>
      <pre className="transaction-data">
        {JSON.stringify(tx, null, 2)}
      </pre>
    </div>
  )

  return (
    <div className="transaction-history card">
      <div className="history-header">
        <h3>Transaction History</h3>
        <div className="tab-buttons">
          <button 
            onClick={() => setActiveTab('history')}
            className={`btn btn-sm ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
          >
            History
          </button>
          <button 
            onClick={() => setActiveTab('withdrawals')}
            className={`btn btn-sm ${activeTab === 'withdrawals' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Withdrawals
          </button>
        </div>
      </div>

      {activeTab === 'history' && (
        <div className="history-tab">
          <button 
            onClick={fetchHistory} 
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Fetching...' : 'Fetch Transaction History'}
          </button>
          
          {loading && <LoadingSpinner size="small" text="Fetching history..." />}
          {error && <ErrorMessage message={error} />}
          
          {history && (
            <div className="history-sections">
              <div className="history-section">
                <h4>Deposits ({history.deposits.length})</h4>
                <div className="transactions-list">
                  {history.deposits.length > 0 ? (
                    history.deposits.map((deposit, index) => 
                      renderTransactionItem(deposit, index, 'Deposit')
                    )
                  ) : (
                    <p className="no-transactions">No deposits found</p>
                  )}
                </div>
              </div>
              
              <div className="history-section">
                <h4>Received Transfers ({history.receiveTransfers.length})</h4>
                <div className="transactions-list">
                  {history.receiveTransfers.length > 0 ? (
                    history.receiveTransfers.map((transfer, index) => 
                      renderTransactionItem(transfer, index, 'Received')
                    )
                  ) : (
                    <p className="no-transactions">No received transfers found</p>
                  )}
                </div>
              </div>
              
              <div className="history-section">
                <h4>Sent Transfers ({history.sendTransfers.length})</h4>
                <div className="transactions-list">
                  {history.sendTransfers.length > 0 ? (
                    history.sendTransfers.map((transfer, index) => 
                      renderTransactionItem(transfer, index, 'Sent')
                    )
                  ) : (
                    <p className="no-transactions">No sent transfers found</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'withdrawals' && (
        <div className="withdrawals-tab">
          <div className="withdrawals-actions">
            <button 
              onClick={fetchWithdrawals} 
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Fetching...' : 'Fetch Withdrawals'}
            </button>
            
            {withdrawals && withdrawals.need_claim.length > 0 && (
              <button 
                onClick={claimWithdrawals} 
                disabled={loading}
                className="btn btn-success"
              >
                {loading ? 'Claiming...' : `Claim ${withdrawals.need_claim.length} Withdrawals`}
              </button>
            )}
          </div>
          
          {loading && <LoadingSpinner size="small" text="Processing..." />}
          {error && <ErrorMessage message={error} />}
          
          {withdrawals && (
            <div className="withdrawals-data">
              <div className="withdrawal-section">
                <h4>Pending Claims ({withdrawals.need_claim.length})</h4>
                {withdrawals.need_claim.length > 0 ? (
                  <pre className="withdrawal-data">
                    {JSON.stringify(withdrawals.need_claim, null, 2)}
                  </pre>
                ) : (
                  <p className="no-withdrawals">No pending withdrawals</p>
                )}
              </div>
              
              <div className="withdrawal-section">
                <h4>All Withdrawals</h4>
                <pre className="withdrawal-data">
                  {JSON.stringify(withdrawals, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
