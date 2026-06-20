// ConfidenceIndicator — Shows AI confidence level with appropriate styling

import Badge from '../../components/ui/Badge'

const CONFIDENCE_CONFIG = {
  high: { label: 'High Confidence', variant: 'success', icon: '✅' },
  medium: { label: 'Medium Confidence', variant: 'warning', icon: '⚠️' },
  low: { label: 'Low Confidence', variant: 'error', icon: '❓' },
}

export default function ConfidenceIndicator({ confidence }) {
  const config = CONFIDENCE_CONFIG[confidence] || CONFIDENCE_CONFIG.medium

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">{config.icon}</span>
      <Badge variant={config.variant}>{config.label}</Badge>
    </div>
  )
}
