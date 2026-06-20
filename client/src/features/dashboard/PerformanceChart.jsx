// PerformanceChart — Score trend chart rendered with pure CSS/HTML bars

export default function PerformanceChart({ trend = [] }) {
  if (!trend.length) {
    return (
      <div className="text-center py-8 text-surface-400 text-sm">
        <p className="text-2xl mb-2">📈</p>
        <p>Complete some practice to see your trend here.</p>
      </div>
    )
  }

  const maxScore = 100
  const recentTrend = trend.slice(-7) // Last 7 days

  return (
    <div>
      <div className="flex items-end gap-2 h-32 mb-3">
        {recentTrend.map((day) => {
          const height = Math.max((day.score / maxScore) * 100, 4)
          const color =
            day.score >= 75 ? 'bg-accent-500' :
            day.score >= 40 ? 'bg-warning-500' :
            'bg-error-500'
          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-surface-400">{day.score}%</span>
              <div className="w-full bg-surface-700 rounded-t-md relative" style={{ height: '100%' }}>
                <div
                  className={`absolute bottom-0 w-full rounded-t-md transition-all duration-500 ${color}`}
                  style={{ height: `${height}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex gap-2">
        {recentTrend.map((day) => (
          <div key={day.date} className="flex-1 text-center">
            <span className="text-[9px] text-surface-500">{day.date.slice(5)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
