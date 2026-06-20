// Badge — Small status/tag indicator
// Props: variant, size ('sm' | 'md'), children, className

export default function Badge({ variant = 'default', size = 'md', children, className = '', ...props }) {
  const variants = {
    default: 'bg-primary-600/20 text-primary-300 border-primary-500/30',
    primary: 'bg-primary-600/20 text-primary-300 border-primary-500/30',
    secondary: 'bg-surface-600/30 text-surface-300 border-surface-500/30',
    success: 'bg-accent-600/20 text-accent-300 border-accent-500/30',
    warning: 'bg-warning-500/20 text-warning-400 border-warning-500/30',
    error: 'bg-error-500/20 text-error-400 border-error-500/30',
    hot: 'bg-gradient-to-r from-warning-500/20 to-error-500/20 text-warning-400 border-warning-500/30',
  }

  const sizes = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2.5 py-0.5 text-xs',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border ${variants[variant] || variants.default} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
