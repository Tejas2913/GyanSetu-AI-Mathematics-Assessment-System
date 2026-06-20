// Loader — Loading spinner / skeleton
// Props: size ('sm' | 'md' | 'lg'), text, className

export default function Loader({ size = 'md', text = 'Loading...', className = '' }) {
  const sizes = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className={`${sizes[size]} animate-spin rounded-full border-2 border-surface-600 border-t-primary-500`} />
      {text && <p className="text-sm text-surface-400">{text}</p>}
    </div>
  )
}
