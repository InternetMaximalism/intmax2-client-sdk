import React from 'react'

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  text?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium',
  text 
}) => {
  return (
    <div className={`spinner-container spinner-${size}`}>
      <div className="spinner" />
      {text && <p className="spinner-text">{text}</p>}
    </div>
  )
}
