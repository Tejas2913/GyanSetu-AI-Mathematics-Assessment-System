// Modal — Overlay dialog
// Props: isOpen, onClose, title, children, className

export default function Modal({ isOpen, onClose, title, children, className = '' }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className={`glass relative z-10 w-full max-w-lg rounded-2xl p-6 shadow-xl ${className}`}>
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-surface-50">{title}</h3>
            <button
              onClick={onClose}
              className="text-surface-400 hover:text-surface-200 transition-default focus-ring rounded-lg p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
