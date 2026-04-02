import { useState } from 'react'
import { useNavigate } from 'react-router'

interface ReviewNavProps {
  boxId: number
  pos: number
  total: number
  prevPos: number | null
  nextPos: number | null
  nextUnreviewedPos: number | null
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
  nextUnreviewedPos,
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
      {/* Navigation */}
      <button
        type="button"
        onClick={() => prevPos !== null && goTo(prevPos)}
        disabled={prevPos === null}
        className="px-3 py-1.5 rounded bg-[#2a2a2a] text-[#ccc] text-sm disabled:opacity-30 hover:bg-[#3a3a3a] disabled:cursor-not-allowed transition-colors"
      >
        ←
      </button>

      <span className="text-[#aaa] text-sm font-medium tabular-nums">
        {pos} / {total}
      </span>

      <button
        type="button"
        onClick={() => nextPos !== null && goTo(nextPos)}
        disabled={nextPos === null}
        className="px-3 py-1.5 rounded bg-[#2a2a2a] text-[#ccc] text-sm disabled:opacity-30 hover:bg-[#3a3a3a] disabled:cursor-not-allowed transition-colors"
      >
        →
      </button>

      {/* Go to */}
      <div className="flex items-center gap-1 ml-1 opacity-60 hover:opacity-100 transition-opacity">
        <span className="text-[#666] text-xs">Jump to</span>
        <input
          type="number"
          min={1}
          max={total}
          value={gotoValue}
          onChange={e => setGotoValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleGoto()}
          placeholder="#"
          className="w-12 px-2 py-1 rounded bg-[#1a1a1a] border border-[#2a2a2a] text-[#999] text-xs focus:outline-none focus:border-[#4a7a9a] focus:opacity-100"
        />
        <button
          type="button"
          onClick={handleGoto}
          className="px-2 py-1 rounded bg-[#222] text-[#888] text-xs hover:bg-[#333] transition-colors"
        >
          Go
        </button>
      </div>

      {/* Next Unreviewed */}
      {nextUnreviewedPos !== null && (
        <button
          type="button"
          onClick={() => goTo(nextUnreviewedPos)}
          className="px-3 py-1.5 rounded text-sm font-medium transition-colors bg-[#3a3a1a] text-[#ccaa44] border border-[#5a4a1a] hover:bg-[#4a4a2a]"
        >
          Next Unreviewed →
        </button>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Reviewed status toggle */}
      <button
        type="button"
        onClick={onToggleReviewed}
        className={`px-3 py-1.5 rounded text-sm transition-colors ${
          reviewed
            ? 'bg-[#1a3a1a] text-[#4a9a4a] border border-[#2a5a2a] hover:bg-[#1e2a1e]'
            : 'bg-[#2a2a2a] text-[#888] border border-[#3a3a3a] hover:bg-[#3a3a3a]'
        }`}
      >
        {reviewed ? '✓ Reviewed' : '○ Unreviewed'}
      </button>

      {/* Review + Next */}
      {!reviewed && nextPos !== null && (
        <button
          type="button"
          onClick={onReviewedNext}
          className="px-4 py-1.5 rounded text-sm font-medium transition-colors bg-[#2a5a2a] text-[#88dd88] border border-[#3a7a3a] hover:bg-[#3a6a3a]"
        >
          ✓ Next →
        </button>
      )}
    </div>
  )
}
