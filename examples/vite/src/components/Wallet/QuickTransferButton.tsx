
// src/components/Wallet/QuickTransferButton.tsx
import React, { useState } from 'react'
import { BroadcastTransactionResponse, IntMaxClient } from 'intmax2-client-sdk'
import { LoadingSpinner } from '../../components/Common/LoadingSpinner'

interface QuickTransferButtonProps {
  client: IntMaxClient
}

export const QuickTransferButton: React.FC<QuickTransferButtonProps> = ({ client }) => {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BroadcastTransactionResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const executeQuickTransfer = async () => {
    try {
      setLoading(true)
      setError(null)
      setResult(null)

      console.log('Getting transfer fee...')
      const transferFee = await client.getTransferFee()
      console.log('Transfer fee:', transferFee)

      // Extract fee information
      const transferFeeToken = transferFee?.fee?.token_index
      const transferFeeAmount = transferFee?.fee?.amount
      
      console.log('Transfer Fee Token Index:', transferFeeToken)
      console.log('Transfer Fee Amount:', transferFeeAmount)

      // Define the token (ETH example from your code)
      const token = {
        tokenType: 0,
        tokenIndex: 0,
        decimals: 18,
        contractAddress: "0x0000000000000000000000000000000000000000",
        price: 2417.08,
      }

      console.log('Executing broadcastTransaction...')
      const transferResult = await client.broadcastTransaction([
        {
          amount: "0.00000000001",
          token,
          address: "0x1264bc1b37258f2e756ed6c827cca4b8830475e69762544603aa3d67f6e8d5b0",
        }
      ])

      console.log('Transfer result:', transferResult)
      setResult(transferResult)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Quick transfer failed'
      setError(errorMessage)
      console.error('Quick transfer error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="quick-transfer card">
      <h3>Quick Transfer Test</h3>
      <p className="transfer-description">
        Execute a test transfer of 0.00000000001 ETH to demonstrate the broadcastTransaction functionality.
      </p>
      
      <div className="transfer-details">
        <div className="detail-item">
          <span>Amount:</span>
          <span>0.00000000001 ETH</span>
        </div>
        <div className="detail-item">
          <span>Recipient:</span>
          <span>0x1264bc1b37258f2e756ed6c827cca4b8830475e69762544603aa3d67f6e8d5b0</span>
        </div>
        <div className="detail-item">
          <span>Token:</span>
          <span>ETH (Native)</span>
        </div>
      </div>

      <button
        onClick={executeQuickTransfer}
        disabled={loading}
        className="btn btn-primary btn-full"
      >
        {loading ? <LoadingSpinner size="small" /> : 'Execute Quick Transfer'}
      </button>

      {error && (
        <div className="error-message">
          <span className="error-icon">❌</span>
          <span className="error-text">{error}</span>
        </div>
      )}

      {result && (
        <div className="success-message">
          <h4>✅ Transfer Successful!</h4>
          <div className="result-details">
            <div className="result-item">
              <span>Transaction Root:</span>
              <code>{result.txTreeRoot}</code>
            </div>
            {result.transferDigests && (
              <div className="result-item">
                <span>Transfer Digests:</span>
                <ul className="digest-list">
                  {result.transferDigests.map((digest: string, index: number) => (
                    <li key={index}>
                      <code>{digest}</code>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <details className="full-result">
            <summary>View Full Result</summary>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  )
}
