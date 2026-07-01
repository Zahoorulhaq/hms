import React from 'react'

interface ToastBodyProps {
  title: string
  description: string
}

export default function ToastBody({ title, description }: ToastBodyProps) {
  return (
    <div className="toast-body prevent-close">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}
