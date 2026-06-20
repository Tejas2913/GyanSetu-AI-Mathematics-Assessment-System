// ReportSummaryCard — Summary statistics card for reports

import Card from '../../components/ui/Card'

export default function ReportSummaryCard({ title, value, subtitle, icon }) {
  return (
    <Card variant="glass" padding="p-4">
      <div className="flex items-center gap-3">
        {icon && <span className="text-2xl">{icon}</span>}
        <div>
          {title && <p className="text-xs text-surface-400 mb-0.5">{title}</p>}
          <p className="text-xl font-bold text-surface-50">{value}</p>
          {subtitle && <p className="text-xs text-surface-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </Card>
  )
}
