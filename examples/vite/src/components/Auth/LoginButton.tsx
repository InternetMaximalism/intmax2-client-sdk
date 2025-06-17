import React from 'react'

interface LoginButtonProps {
  onLogin: () => Promise<void>
  loading?: boolean
}

export const LoginButton: React.FC<LoginButtonProps> = ({ 
  onLogin, 
  loading = false 
}) => {
  return (
    <button 
      onClick={onLogin}
      disabled={loading}
      className="btn btn-primary"
    >
      {loading ? 'Connecting...' : 'Connect Wallet'}
    </button>
  )
}
