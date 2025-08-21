import React, { useState, useEffect } from 'react'
import type { FeeResponse, INTMAXClient, TokenBalance } from 'intmax2-client-sdk'
import { formatUnits } from 'viem'
import { LoadingSpinner } from '../../components/Common/LoadingSpinner'
import { ErrorMessage } from '../../components/Common/ErrorMessage'
import { getTokenDecimals } from '../../lib/utils'

interface WithdrawFormProps {
  client: INTMAXClient
}

interface WithdrawFormData {
  tokenIndex: string
  address: string
  amount: string
}

export const WithdrawForm: React.FC<WithdrawFormProps> = ({ client }) => {
  const [formData, setFormData] = useState<WithdrawFormData>({
    tokenIndex: '',
    address: '',
    amount: ''
  })
  const [balances, setBalances] = useState<TokenBalance[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [fees, setFees] = useState<{ withdrawal: FeeResponse; transfer: FeeResponse } | null>(null)

  useEffect(() => {
    fetchBalances()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client])

  const fetchBalances = async () => {
    try {
      const { balances: newBalances } = await client.fetchTokenBalances()
      setBalances(newBalances.filter(b => b.amount > 0))
    } catch (err) {
      console.error('Failed to fetch balances:', err)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
    setSuccess(null)
  }

  const calculateFees = async () => {
    if (!formData.tokenIndex) return

    try {
      const selectedBalance = balances.find(b => 
        b.token.tokenIndex === Number(formData.tokenIndex)
      )
      
      if (!selectedBalance) return

      const [withdrawalFee, transferFee] = await Promise.all([
        client.getWithdrawalFee(selectedBalance.token),
        client.getTransferFee()
      ])

      setFees({ withdrawal: withdrawalFee, transfer: transferFee })
    } catch (err) {
      console.error('Failed to calculate fees:', err)
    }
  }

  useEffect(() => {
    if (formData.tokenIndex) {
      calculateFees()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.tokenIndex])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.tokenIndex || !formData.address || !formData.amount) {
      setError('All fields are required')
      return
    }

    const selectedBalance = balances.find(b => 
      b.token.tokenIndex === Number(formData.tokenIndex)
    )
    
    if (!selectedBalance) {
      setError('Selected token not found')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const withdrawResult = await client.withdraw({
        amount: formData.amount,
        token: selectedBalance.token,
        address: formData.address as `0x${string}`,
      })

      console.log('Withdrawal result:', withdrawResult)
      setSuccess(`Withdrawal successful! Transaction: ${JSON.stringify(withdrawResult, null, 2)}`)
      
      // Reset form and refresh balances
      setFormData({ tokenIndex: '', address: '', amount: '' })

      const withdrawalConfirmation = await client.waitForTransactionConfirmation(withdrawResult);
      console.log('Withdrawal confirmation result:', JSON.stringify(withdrawalConfirmation, null, 2));

      await fetchBalances()
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Withdrawal failed'
      setError(errorMessage)
      console.error('Withdrawal error:', err)
    } finally {
      setLoading(false)
    }
  }

  // TODO: Display values considering decimals.
  const withdrawalFeeAmount = fees?.withdrawal.fee?.amount || 'N/A'
  const transferFeeAmount = fees?.transfer.fee?.amount || 'N/A'

  return (
    <div className="withdraw-form card">
      <h3>Withdraw Tokens</h3>
      
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="tokenIndex">Select Token</label>
          <select
            id="tokenIndex"
            name="tokenIndex"
            value={formData.tokenIndex}
            onChange={handleInputChange}
            className="form-select"
            disabled={loading}
          >
            <option value="">Choose a token...</option>
            {balances.map((balance) => (
              <option key={balance.token.tokenIndex} value={balance.token.tokenIndex}>
                {balance.token.symbol || 'UNKNOWN'} - Balance: {formatUnits(balance.amount, getTokenDecimals(balance.token))}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="address">Ethereum Address</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="0x..."
            className="form-input"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            placeholder="0.000001"
            step="any"
            min="0"
            className="form-input"
            disabled={loading}
          />
        </div>

        {fees && (
          <div className="fees-info">
            <h4>Transaction Fees</h4>
            <div className="fee-item">
              <span>Withdrawal Fee:</span>
              <span>{withdrawalFeeAmount}</span>
            </div>
            <div className="fee-item">
              <span>Transfer Fee:</span>
              <span>{transferFeeAmount}</span>
            </div>
          </div>
        )}

        {error && <ErrorMessage message={error} />}
        {success && (
          <div className="success-message">
            <p>✅ {success}</p>
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading || balances.length === 0}
          className="btn btn-primary btn-full"
        >
          {loading ? <LoadingSpinner size="small" /> : 'Submit Withdrawal'}
        </button>
        
        {balances.length === 0 && (
          <p className="no-balances-warning">
            No available balances for withdrawal. Please deposit tokens first.
          </p>
        )}
      </form>
    </div>
  )
}
