// Card — Container primitive with glassmorphism
// Props: variant ('default' | 'glass'), hover, padding, children, className

export default function Card({ variant = 'default', hover = false, padding = 'p-6', children, className = '', ...props }) {
  const variants = {
    default: 'bg-surface-800 border border-surface-700 rounded-2xl',
    glass: 'glass rounded-2xl',
  }

  const hoverClass = hover ? 'hover:shadow-card-hover hover:border-primary-600/30 transition-default' : ''

  return (
    <div className={`${variants[variant]} ${padding} ${hoverClass} ${className}`} {...props}>
      {children}
    </div>
  )
}
