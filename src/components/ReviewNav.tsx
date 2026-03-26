import { useState } from 'react'
import { useNavigate } from 'react-router'

interface ReviewNavProps {
  boxId: number
  pos: number
  total: number
  prevPos: number | null
  nextPos: number | null
  reviewed: boolean
  cardId: number
  onReviewedNext: () => void
  onToggleReviewed: () => void
}

export default function ReviewNav({
  boxId,
  pos,
  total,
  prevPos,
  nextPos,
  reviewed,
  onReviewedNext,
  onToggleReviewed,
}: ReviewNavProps) {
  const navigate = useNavigate()
  const [gotoValue, setGotoValue] = useState('')

  const goTo = (targetPos: number) => {
    navigate(`/review?box_id=${boxId}&pos=${targetPos}`)
  }

  const handleGoto = () => {
    const n = parseInt(gotoValue, 10)
    if (!isNaN(n) && n >= 1 && n <= total) {
      goTo(n)
      setGotoValue('')
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Prev */}
      <button
        type="button"
        onClick={() => prevPos !== null && goTo(prevPos)}
        disabled={prevPos === null}
        className="px-3 py-1.5 rounded bg-[#2a2a2a] text-[#ccc] text-sm disabled:opacity-40 hover:bg-[#3a3a3a] disabled:cursor-not-allowed transition-colors"
      >
        ← Prev
      </button>

      {/* Position display */}
      <span className="text-[#888] text-sm">
        {pos} / {total}
      </span>

      {/* Next */}
      <button
        type="button"
        onClick={() => nextPos !== null && goTo(nextPos)}
        disabled={nextPos === null}
        className="px-3 py-1.5 rounded bg-[#2a2a2a] text-[#ccc] text-sm disabled:opacity-40 hover:bg-[#3a3a3a] disabled:cursor-not-allowed transition-colors"
      >
        Next →
      </button>

      {/* Reviewed + Next */}
      <button
        type="button"
        onClick={onReviewedNext}
        className="px-3 py-1.5 rounded bg-[#1a3a1a] text-[#4a9a4a] text-sm hover:bg-[#1e4a1e] transition-colors"
      >
        Reviewed ✓ →
      </button>

      {/* Go to field */}
      <div className="flex items-center gap-1 ml-2">
        <span className="text-[#666] text-xs">Go to</span>
        <input
          type="number"
          min={1}
          max={total}
          value={gotoValue}
          onChange={e => setGotoValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleGoto()}
          placeholder="#"
          className="w-16 px-2 py-1 rounded bg-[#1e1e1e] border border-[#333] text-[#ccc] text-sm focus:outline-none focus:border-[#4a7a9a]"
        />
        <button
          type="button"
          onClick={handleGoto}
          className="px-2 py-1 rounded bg-[#2a2a2a] text-[#ccc] text-sm hover:bg-[#3a3a3a] transition-colors"
        >
          Go
        </button>
      </div>

      {/* Spacer + Reviewed toggle */}
      <div className="flex-1" />
      <button
        type="button"
        onClick={onToggleReviewed}
        className={`px-3 py-1.5 rounded text-sm transition-colors ${
          reviewed
            ? 'bg-[#1a3a1a] text-[#4a9a4a] hover:bg-[#1e2a1e]'
            : 'bg-[#2a2a2a] text-[#888] hover:bg-[#3a3a3a]'
        }`}
      >
        {reviewed ? '✓ Reviewed' : 'Mark Reviewed'}
      </button>
    </div>
  )
}
