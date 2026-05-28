import { motion } from 'framer-motion'

const TABS = [
  { id: 'home',  label: 'Home',  icon: '🏠' },
  { id: 'stats', label: 'Stats', icon: '📊' },
]

export default function BottomTabBar({ activeTab, onTabChange }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-30 bg-surface border-t border-surface2 pb-safe">
      <div className="flex">
        {TABS.map(tab => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex-1 flex flex-col items-center justify-center py-3 gap-1 relative"
            >
              <span className="text-xl leading-none">{tab.icon}</span>
              <span className={`text-[10px] font-medium tracking-wide transition-colors ${
                active ? 'text-accent' : 'text-zinc-600'
              }`}>
                {tab.label}
              </span>
              {active && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-accent"
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
