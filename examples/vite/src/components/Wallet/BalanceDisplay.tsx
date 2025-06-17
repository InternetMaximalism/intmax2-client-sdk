import React, { useState } from 'react'
import { IntMaxClient, type TokenBalance } from 'intmax2-client-sdk'
import { formatUnits } from 'viem'
import { LoadingSpinner } from '../../components/Common/LoadingSpinner'
import { ErrorMessage } from '../../components/Common/ErrorMessage'
import { getTokenDecimals } from '../../lib/utils'

interface BalanceDisplayProps {
  client: IntMaxClient
}

export const BalanceDisplay: React.FC<BalanceDisplayProps> = ({ client }) => {
  const [balances, setBalances] = useState<TokenBalance[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBalances = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { balances: newBalances } = await client.fetchTokenBalances()
      setBalances(newBalances)
      
      // // Test message signing
      // const message = 'Hello, IntMax2!'
      // const signature = await client.signMessage(message)
      // console.log('Message signature test:', signature)
      
      // const isVerified = await client.verifySignature(signature, message)
      // console.log('Signature verification:', isVerified)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch balances'
      setError(errorMessage)
      console.error('Balance fetch failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatBalance = (balance: TokenBalance) => {
    const decimals = getTokenDecimals(balance.token);
    const amount = formatUnits(balance.amount, decimals)
    const symbol = balance.token.symbol || ''
    return `${amount} ${symbol}`
  }

  return (
    <div className="balance-display card">
      <div className="balance-header">
        <h3>Token Balances</h3>
        <button 
          onClick={fetchBalances} 
          disabled={loading}
          className="btn btn-primary btn-sm"
        >
          {loading ? 'Fetching...' : 'Refresh Balances'}
        </button>
      </div>
      
      {loading && <LoadingSpinner size="small" text="Fetching balances..." />}
      {error && <ErrorMessage message={error} />}
      
      {balances.length > 0 ? (
        <div className="balances-list">
          {balances.map((balance) => (
            <div key={balance.token.contractAddress} className="balance-item">
              <div className="token-info">
                <span className="token-symbol">{balance.token.symbol || `Token #${balance.token.tokenIndex}`}</span>
                {" "}
                <span className="token-address">{balance.token.contractAddress}</span>
              </div>
              <div className="balance-amount">
                {formatBalance(balance)}
              </div>
            </div>
          ))}
        </div>
      ) : !loading && (
        <div className="no-balances">
          <p>No token balances found. Try fetching balances or making a deposit.</p>
        </div>
      )}
    </div>
  )
}
