import React, { useState, useEffect } from 'react'
import { IntMaxClient, TokenBalance } from 'intmax2-client-sdk'
import { formatUnits } from 'viem'
import { LoadingSpinner } from '../../components/Common/LoadingSpinner'
import { ErrorMessage } from '../../components/Common/ErrorMessage'
import { getTokenDecimals } from '../../lib/utils'

const placeHolderIntmaxAddress = '0x2b58f57c811b0c0551bd4347f96b2df47e2ca833fce943df28d3b5b31929ce30'

interface TransferFormProps {
  client: IntMaxClient
}

interface TransferFormData {
  recipient: string
  amount: string
  tokenIndex: string
}

interface Fee {
  token_index: number
  amount: string
}

interface TransferFeeData {
  beneficiary?: string
  fee?: Fee
  collateral_fee?: Fee
}

export const TransferForm: React.FC<TransferFormProps> = ({ client }) => {
  const [formData, setFormData] = useState<TransferFormData>({
    recipient: '',
    amount: '',
    tokenIndex: ''
  })
  const [balances, setBalances] = useState<TokenBalance[]>([])
  const [transferFee, setTransferFee] = useState<TransferFeeData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchBalances()
    fetchTransferFee()
  }, [client])

  const fetchBalances = async () => {
    try {
      const { balances: newBalances } = await client.fetchTokenBalances()
      setBalances(newBalances.filter(b => b.amount > 0))
    } catch (err) {
      console.error('Failed to fetch balances:', err)
    }
  }

  const fetchTransferFee = async () => {
    try {
      const feeData = await client.getTransferFee()
      setTransferFee(feeData)
      console.log('Transfer fee data:', feeData)
    } catch (err) {
      console.error('Failed to fetch transfer fee:', err)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
    setSuccess(null)
  }

  const getSelectedToken = () => {
    if (!formData.tokenIndex) return null
    return balances.find(b => b.token.tokenIndex === Number(formData.tokenIndex))
  }

  const calculateTotalCost = () => {
    if (!transferFee?.fee || !formData.amount) return null
    
    const transferAmount = parseFloat(formData.amount)
    const feeAmount = parseFloat(transferFee.fee.amount || '0')
    const total = transferAmount + feeAmount
    
    return {
      transferAmount,
      feeAmount,
      total
    }
  }

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.recipient || !formData.amount || !formData.tokenIndex) {
      setError('All fields are required')
      return
    }

    const selectedBalance = getSelectedToken()
    if (!selectedBalance) {
      setError('Selected token not found')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      // Get latest transfer fee
      const currentTransferFee = await client.getTransferFee()
      console.log('Current transfer fee:', currentTransferFee)

      // Prepare token object (similar to the example)
      console.log('Prepared token:', selectedBalance.token)

      // Execute transfer using broadcastTransaction
      const transferResult = await client.broadcastTransaction([
        {
          amount: formData.amount,
          token: selectedBalance.token,
          address: formData.recipient,
        }
      ])

      console.log('Transfer result:', transferResult)
      
      setSuccess(`Transfer successful!\nTx Root: ${transferResult.txTreeRoot}\nTransfer Digests: ${transferResult.transferDigests?.join(', ')}`)
      
      // Reset form and refresh balances
      setFormData({ recipient: '', amount: '', tokenIndex: '' })
      await fetchBalances()
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transfer failed'
      setError(errorMessage)
      console.error('Transfer error:', err)
    } finally {
      setLoading(false)
    }
  }

  const costs = calculateTotalCost()
  const selectedToken = getSelectedToken()
  const selectedTokenDecimals = selectedToken ? getTokenDecimals(selectedToken.token) : 0
  const selectedTokenAmount = selectedToken ? formatUnits(selectedToken.amount, selectedTokenDecimals) : ""

  return (
    <div className="transfer-form card">
      <h3>Send Transfer</h3>
      
      <form onSubmit={handleTransfer} className="form">
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
          <label htmlFor="recipient">Recipient Address</label>
          <input
            type="text"
            id="recipient"
            name="recipient"
            value={formData.recipient}
            onChange={handleInputChange}
            placeholder={placeHolderIntmaxAddress}
            className="form-input"
            disabled={loading}
          />
        </div>
        <div>
          <small className="form-hint">
            Enter the recipient's INTMAX or Ethereum address
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            placeholder="0.00000000001"
            step="any"
            min="0"
            className="form-input"
            disabled={loading}
          />
          {selectedToken && (
            <small className="form-hint">
              Available: {selectedTokenAmount} {selectedToken.token.symbol}
            </small>
          )}
        </div>

        {transferFee && (
          <div className="transfer-fee-info">
            <h4>Transfer Fee Information</h4>
            <div className="fee-details">
              <div className="fee-item">
                <span>Beneficiary:</span>
                <span className="fee-value">
                  {transferFee.beneficiary ? `${transferFee.beneficiary.slice(0, 10)}...` : 'N/A'}
                </span>
              </div>
              {transferFee.fee && (
                <>
                  <div className="fee-item">
                    <span>Fee Token Index:</span>
                    <span className="fee-value">{transferFee.fee.token_index}</span>
                  </div>
                  <div className="fee-item">
                    <span>Fee Amount:</span>
                    <span className="fee-value">{transferFee.fee.amount}</span>
                  </div>
                </>
              )}
              {transferFee.collateral_fee && (
                <div className="fee-item">
                  <span>Collateral Fee:</span>
                  <span className="fee-value">Yes</span>
                </div>
              )}
            </div>
          </div>
        )}

        {costs && transferFee?.fee && (
          <div className="cost-breakdown">
            <h4>Cost Breakdown</h4>
            <div className="cost-item">
              <span>Transfer Amount:</span>
              <span>{costs.transferAmount} {selectedToken?.token.symbol}</span>
            </div>
            <div className="cost-item">
              <span>Network Fee:</span>
              <span>{costs.feeAmount}</span>
            </div>
            <div className="cost-item cost-total">
              <span><strong>Total Required:</strong></span>
              <span><strong>{costs.total} {selectedToken?.token.symbol}</strong></span>
            </div>
          </div>
        )}

        {error && <ErrorMessage message={error} />}
        {success && (
          <div className="success-message">
            <h4>✅ Transfer Completed!</h4>
            <pre className="success-details">{success}</pre>
          </div>
        )}

        <div className="form-actions">
          <button 
            type="button"
            onClick={fetchTransferFee}
            disabled={loading}
            className="btn btn-secondary"
          >
            {loading ? 'Fetching...' : 'Refresh Fee Info'}
          </button>
          
          <button 
            type="submit" 
            disabled={loading || balances.length === 0 || !transferFee}
            className="btn btn-primary"
          >
            {loading ? <LoadingSpinner size="small" /> : 'Send Transfer'}
          </button>
        </div>
        
        {balances.length === 0 && (
          <p className="no-balances-warning">
            No available balances for transfer. Please deposit tokens first.
          </p>
        )}
        
        {!transferFee && (
          <p className="no-fee-warning">
            Transfer fee information not available. Please try refreshing.
          </p>
        )}
      </form>
    </div>
  )
}
