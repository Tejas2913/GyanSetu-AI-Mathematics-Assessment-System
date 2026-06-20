// Toast — Notification toast component

export default function Toast({ message, variant = 'info', onClose }) {
  if (!message) return null

  const variants = {
    success: 'border-accent-500/50 bg-accent-600/10 text-accent-300',
    error: 'border-error-500/50 bg-error-600/10 text-error-300',
    info: 'border-primary-500/50 bg-primary-600/10 text-primary-300',
  }

  return (
    <div
      role="alert"
      className={`fixed top-20 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-in slide-in-from-right ${variants[variant]}`}
    >
      <span className="text-sm">{message}</span>
      <button
        onClick={onClose}
        className="text-surface-400 hover:text-surface-200 cursor-pointer"
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  )
}