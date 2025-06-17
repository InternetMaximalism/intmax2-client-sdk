import React from 'react'

interface ErrorMessageProps {
  message: string
  onDismiss?: () => void
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onDismiss }) => {
  return (
    <div className="error-message">
      <div className="error-content">
        <span className="error-icon">❌</span>
        <span className="error-text">{message}</span>
      </div>
      {onDismiss && (
        <button 
          onClick={onDismiss}
          className="error-dismiss"
          aria-label="Dismiss error"
        >
          ×
        </button>
      )}
    </div>
  )
}
