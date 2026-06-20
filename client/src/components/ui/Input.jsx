// Input — Form input primitive
// Props: label, error, type, icon, className, and all standard input props

import { forwardRef } from 'react'

const Input = forwardRef(function Input({ label, error, type = 'text', icon, className = '', ...props }, ref) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-surface-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-surface-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`w-full bg-surface-800 border border-surface-600 rounded-xl px-4 py-2.5 text-surface-50 placeholder-surface-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-default ${icon ? 'pl-10' : ''} ${error ? 'border-error-500' : ''}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-error-400">{error}</p>
      )}
    </div>
  )
})

export default Input
