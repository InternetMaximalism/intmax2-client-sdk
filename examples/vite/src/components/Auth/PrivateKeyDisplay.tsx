import React, { useState } from 'react'
import { IntMaxClient } from 'intmax2-client-sdk'

interface PrivateKeyDisplayProps {
  client: IntMaxClient
}

export const PrivateKeyDisplay: React.FC<PrivateKeyDisplayProps> = ({ client }) => {
  const [privateKey, setPrivateKey] = useState<string>('')
  const [isVisible, setIsVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  const showPrivateKey = async () => {
    try {
      setLoading(true)
      const key = await client.getPrivateKey()
      setPrivateKey(key)
      setIsVisible(true)
      
      // Auto hide after 5 seconds
      setTimeout(() => {
        setIsVisible(false)
        setPrivateKey('')
      }, 5000)
    } catch (error) {
      console.error('Failed to get private key:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="private-key-display">
      <button 
        onClick={showPrivateKey}
        disabled={loading || isVisible}
        className="btn btn-warning"
      >
        {loading ? 'Getting Key...' : isVisible ? 'Key Shown' : 'Show Private Key'}
      </button>
      
      {isVisible && (
        <div className="private-key-container">
          <div className="private-key-warning">
            ⚠️ Keep this private! Auto-hiding in 5 seconds...
          </div>
          <div className="private-key-value">
            <code>{privateKey}</code>
          </div>
        </div>
      )}
    </div>
  )
}
