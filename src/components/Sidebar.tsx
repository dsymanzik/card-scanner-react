import { NavLink } from 'react-router'

const navItems = [
  { to: '/boxes', label: 'Boxes', icon: '📦' },
  { to: '/review', label: 'Card Review', icon: '🃏' },
  { to: '/export', label: 'Export CSV', icon: '📤' },
  { to: '/monitoring', label: 'Monitoring', icon: '🔍' },
]

export default function Sidebar() {
  return (
    <nav className="w-40 shrink-0 bg-[#141414] p-3.5 flex flex-col gap-0.5 min-h-screen">
      <div className="text-[#555] text-[10px] uppercase tracking-widest pl-1.5 mb-2">
        Navigation
      </div>
      {navItems.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `block px-3 py-2 rounded-md text-[13px] no-underline transition-colors ${
              isActive
                ? 'bg-[#1a3a1a] text-[#88cc88] font-bold'
                : 'text-[#888] hover:bg-[#222] hover:text-[#ccc]'
            }`
          }
        >
          {icon} {label}
        </NavLink>
      ))}
    </nav>
  )
}
