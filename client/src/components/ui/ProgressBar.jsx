// ProgressBar — Visual progress indicator
// Props: value (0-100), variant ('primary' | 'success' | 'warning' | 'error'), label, showPercent, className

export default function ProgressBar({ value = 0, variant = 'primary', label, showPercent = true, className = '' }) {
  const clampedValue = Math.min(100, Math.max(0, value))

  const variants = {
    primary: 'bg-primary-500',
    success: 'bg-accent-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
  }

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm text-surface-300">{label}</span>}
          {showPercent && <span className="text-sm font-medium text-surface-200">{Math.round(clampedValue)}%</span>}
        </div>
      )}
      <div className="w-full h-2 bg-surface-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${variants[variant]}`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  )
}
