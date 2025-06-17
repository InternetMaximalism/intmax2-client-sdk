import React from 'react'

interface LogoutButtonProps {
  onLogout: () => Promise<void>
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ onLogout }) => {
  const handleLogout = async () => {
    try {
      await onLogout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <button 
      onClick={handleLogout}
      className="btn btn-secondary"
    >
      Logout
    </button>
  )
}
