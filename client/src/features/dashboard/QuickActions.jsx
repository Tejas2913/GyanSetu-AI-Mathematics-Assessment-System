// QuickActions — Start practice / view cheat sheet shortcuts

import Card from '../../components/ui/Card'

const actions = [
  { label: 'Start Practice', desc: 'Solve questions & get graded', icon: '🚀', path: '/practice', color: 'primary' },
  { label: 'Cheat Sheet', desc: 'Formulas & concepts', icon: '📚', path: '/cheatsheet', color: 'accent' },
  { label: 'Weak Topics', desc: 'Focus on gaps', icon: '🎯', path: '/practice', color: 'warning' },
]

export default function QuickActions({ onNavigate }) {
  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {actions.map((action) => (
        <Card
          key={action.label}
          variant="glass"
          hover
          className="cursor-pointer group"
          onClick={() => onNavigate?.(action.path)}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-${action.color}-600/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-default`}>
              {action.icon}
            </div>
            <div>
              <h3 className="font-semibold text-surface-50">{action.label}</h3>
              <p className="text-sm text-surface-400">{action.desc}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
