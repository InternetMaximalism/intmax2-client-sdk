import React, { useState } from 'react'
import { IntMaxClient, TokenType } from 'intmax2-client-sdk'
import { LoadingSpinner } from '../../components/Common/LoadingSpinner'
import { ErrorMessage } from '../../components/Common/ErrorMessage'

interface DepositFormProps {
  client: IntMaxClient
}

interface DepositFormData {
  contractAddress: string
  address: string
  amount: string
}

export const DepositForm: React.FC<DepositFormProps> = ({ client }) => {
  const [formData, setFormData] = useState<DepositFormData>({
    contractAddress: '',
    address: '',
    amount: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
    setSuccess(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.contractAddress || !formData.address || !formData.amount) {
      setError('All fields are required')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      // Get available tokens
      const tokens = await client.getTokensList()
      let token = tokens.find((t) => 
        t.contractAddress.toLowerCase() === formData.contractAddress.toLowerCase()
      )

      if (token) {
        token = {
          ...token,
          tokenType: token.contractAddress === '0x0000000000000000000000000000000000000000' 
            ? TokenType.NATIVE 
            : TokenType.ERC20,
        }
      }

      if (!token) {
        setError('Token not found in the available tokens list')
        return
      }

      // Estimate gas first
      const gas = await client.estimateDepositGas({
        amount: Number(formData.amount),
        token,
        address: formData.address,
        isGasEstimation: true,
      })
      
      console.log('Estimated gas:', gas.toString())

      // Execute deposit
      const deposit = await client.deposit({
        amount: Number(formData.amount),
        token,
        address: formData.address,
      })

      console.log('Deposit result:', deposit)
      setSuccess(`Deposit successful! Transaction: ${JSON.stringify(deposit, null, 2)}`)
      
      // Reset form
      setFormData({ contractAddress: '', address: '', amount: '' })
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Deposit failed'
      setError(errorMessage)
      console.error('Deposit error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="deposit-form card">
      <h3>Deposit Tokens</h3>
      
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="contractAddress">Contract Address</label>
          <input
            type="text"
            id="contractAddress"
            name="contractAddress"
            value={formData.contractAddress}
            onChange={handleInputChange}
            placeholder="0x0000000000000000000000000000000000000000"
            className="form-input"
            disabled={loading}
          />
        </div>
        <div>
          <small className="form-hint">
            Use 0x0000000000000000000000000000000000000000 for native ETH
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="address">Recipient Address</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="INTMAX address"
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

        {error && <ErrorMessage message={error} />}
        {success && (
          <div className="success-message">
            <p>✅ {success}</p>
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="btn btn-primary btn-full"
        >
          {loading ? <LoadingSpinner size="small" /> : 'Submit Deposit'}
        </button>
      </form>
    </div>
  )
}
