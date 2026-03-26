interface BadgeProps {
  variant: 'ok' | 'warn' | 'error' | 'default'
  children: React.ReactNode
}

const variantClasses = {
  ok: 'bg-[#1a3a1a] text-[#4a9a4a]',
  warn: 'bg-[#4a3a1a] text-[#cc9944]',
  error: 'bg-[#3a1a1a] text-[#cc5555]',
  default: 'bg-[#2a2a2a] text-[#888]',
}

export default function Badge({ variant, children }: BadgeProps) {
  return (
    <span className={`rounded-xl px-2.5 py-0.5 text-[11px] ${variantClasses[variant]}`}>
      {children}
    </span>
  )
}
