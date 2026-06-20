// Button — Primary UI primitive
// Props: variant ('primary' | 'secondary' | 'ghost' | 'danger'), size ('sm' | 'md' | 'lg'), loading, disabled, children, onClick, className

export default function Button({ variant = 'primary', size = 'md', loading = false, disabled = false, children, onClick, className = '', ...props }) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-default focus-ring cursor-pointer'

  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-500 text-white shadow-glow',
    secondary: 'bg-surface-700 hover:bg-surface-600 text-surface-50 border border-surface-600',
    ghost: 'bg-transparent hover:bg-surface-700 text-surface-200',
    danger: 'bg-error-600 hover:bg-error-500 text-white',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
