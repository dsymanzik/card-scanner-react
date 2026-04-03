import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useBoxesStore } from '../stores/boxesStore'
import { useCardsStore } from '../stores/cardsStore'
import Badge from '../components/Badge'
import { parseRange } from '../utils/parseRange'
import type { Box } from '../types'

export default function BoxesPage() {
  const { boxes, loading, error, fetchBoxes, renameBox, mergeBox } = useBoxesStore()
  const { cards, fetchCards, moveCards } = useCardsStore()

  useEffect(() => {
    fetchBoxes()
    fetchCards()
  }, [fetchBoxes, fetchCards])

  if (loading && boxes.length === 0) {
    return (
      <div className="p-6" style={{ color: '#888' }}>
        Loading boxes...
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header + New Box form */}
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-xl font-semibold" style={{ color: '#ccc' }}>
          Your Boxes
        </h1>
        {boxes.length > 0 && (
          <span className="text-xs" style={{ color: '#666' }}>
            {boxes.length} {boxes.length === 1 ? 'box' : 'boxes'} · {boxes.reduce((sum, b) => sum + b.total, 0)} total cards
          </span>
        )}
      </div>

      {error && (
        <p className="mb-4 text-sm" style={{ color: '#cc5555' }}>
          {error}
        </p>
      )}

      {/* Box list */}
      {boxes.length === 0 ? (
        <p className="text-sm" style={{ color: '#666' }}>
          No boxes found.
        </p>
      ) : (
        <div className="flex flex-col gap-3" style={{ maxWidth: '600px' }}>
          {boxes.map((box) => (
            <BoxRow
              key={box.id}
              box={box}
              allBoxes={boxes}
              cards={cards}
              onRename={renameBox}
              onMerge={mergeBox}
              onMoveCards={moveCards}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── BoxRow ──────────────────────────────────────────────────────────────────

interface BoxRowProps {
  box: Box
  allBoxes: Box[]
  cards: import('../types').Card[]
  onRename: (boxId: number, name: string) => Promise<void>
  onMerge: (targetBoxId: number, sourceBoxId: number) => Promise<void>
  onMoveCards: (cardIds: number[], targetBoxId: number) => Promise<void>
}

function BoxRow({ box, allBoxes, cards, onRename, onMerge, onMoveCards }: BoxRowProps) {
  const [renameValue, setRenameValue] = useState(box.name)

  // Merge dropdown
  const [mergeOpen, setMergeOpen] = useState(false)
  const [mergeTargetId, setMergeTargetId] = useState<number | ''>('')

  // Move dropdown
  const [moveOpen, setMoveOpen] = useState(false)
  const [moveRange, setMoveRange] = useState('')
  const [moveTargetId, setMoveTargetId] = useState<number | ''>('')

  const otherBoxes = allBoxes.filter((b) => b.id !== box.id)

  const handleRename = async () => {
    const name = renameValue.trim()
    if (!name || name === box.name) return
    await onRename(box.id, name)
  }

  const handleMerge = async () => {
    if (mergeTargetId === '') return
    // box is SOURCE, mergeTargetId is TARGET
    await onMerge(mergeTargetId as number, box.id)
    setMergeOpen(false)
    setMergeTargetId('')
  }

  const handleMove = async () => {
    if (moveTargetId === '' || !moveRange.trim()) return
    const positions = parseRange(moveRange)
    const boxCards = cards.filter((c) => c.box_id === box.id)
    const posSet = new Set(positions)
    const cardIds = boxCards.filter((c) => posSet.has(c.position)).map((c) => c.id)
    if (cardIds.length === 0) return
    await onMoveCards(cardIds, moveTargetId as number)
    setMoveOpen(false)
    setMoveRange('')
    setMoveTargetId('')
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Main row: name + badges + actions all inline */}
      <div
        className="rounded px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3"
        style={{ background: '#2a2a2a', border: '1px solid #3a3a3a', borderLeft: '3px solid #88ccee' }}
      >
        {/* Left: name + counts */}
        <div className="flex flex-col">
          <Link
            to={`/review?box_id=${box.id}`}
            className="font-medium hover:underline transition-colors duration-150"
            style={{ color: '#88ccee' }}
          >
            {box.name}
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: '#888' }}>
              {box.total} cards
            </span>
            {box.unreviewed > 0 && (
              <>
                <span className="text-xs" style={{ color: '#555' }}>·</span>
                <Badge variant="warn">{box.unreviewed} unreviewed</Badge>
              </>
            )}
          </div>
        </div>

        {/* Right: rename + actions */}
        <div className="sm:ml-auto flex items-center gap-2 flex-wrap">
          <button
            onClick={() => { setMergeOpen((o) => !o); setMoveOpen(false) }}
            className="px-3 py-1 rounded text-xs whitespace-nowrap transition-colors duration-150 bg-[#2a2a2a] border border-[#4a4a4a] text-[#ccc] hover:bg-[#353535] hover:border-[#5a5a5a]"
          >
            ▶ 📦 Merge into...
          </button>
          <button
            onClick={() => { setMoveOpen((o) => !o); setMergeOpen(false) }}
            className="px-3 py-1 rounded text-xs whitespace-nowrap transition-colors duration-150 bg-[#2a2a2a] border border-[#4a4a4a] text-[#ccc] hover:bg-[#353535] hover:border-[#5a5a5a]"
          >
            ▶ 📦 Move cards...
          </button>
        </div>
      </div>

      {/* Merge panel */}
      {mergeOpen && (
        <div
          className="rounded px-4 py-2 flex gap-2 items-center flex-wrap"
          style={{ background: '#252525', border: '1px solid #3a3a3a' }}
        >
          <span className="text-xs" style={{ color: '#666' }}>
            Merge <span style={{ color: '#ccc' }}>{box.name}</span> into:
          </span>
          <select
            value={mergeTargetId}
            onChange={(e) =>
              setMergeTargetId(e.target.value === '' ? '' : Number(e.target.value))
            }
            className="px-2 py-1 rounded text-sm outline-none"
            style={{ background: '#1a1a1a', border: '1px solid #4a4a4a', color: '#ccc' }}
          >
            <option value="">Select destination...</option>
            {otherBoxes.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleMerge}
            disabled={mergeTargetId === ''}
            className="px-3 py-1 rounded text-xs disabled:opacity-40"
            style={{ background: '#4a3a1a', color: '#cc9944' }}
          >
            Merge
          </button>
          <button
            onClick={() => setMergeOpen(false)}
            className="px-2 py-1 rounded text-xs"
            style={{ color: '#666' }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Move panel */}
      {moveOpen && (
        <div
          className="rounded px-4 py-2 flex gap-2 items-center flex-wrap"
          style={{ background: '#252525', border: '1px solid #3a3a3a' }}
        >
          <span className="text-xs" style={{ color: '#666' }}>
            Move positions:
          </span>
          <input
            type="text"
            placeholder="e.g. 1,3,50-60"
            value={moveRange}
            onChange={(e) => setMoveRange(e.target.value)}
            className="px-2 py-1 rounded text-sm outline-none"
            style={{
              background: '#1a1a1a',
              border: '1px solid #4a4a4a',
              color: '#ccc',
              width: '140px',
            }}
          />
          <span className="text-xs" style={{ color: '#666' }}>
            to:
          </span>
          <select
            value={moveTargetId}
            onChange={(e) =>
              setMoveTargetId(e.target.value === '' ? '' : Number(e.target.value))
            }
            className="px-2 py-1 rounded text-sm outline-none"
            style={{ background: '#1a1a1a', border: '1px solid #4a4a4a', color: '#ccc' }}
          >
            <option value="">Select destination...</option>
            {otherBoxes.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleMove}
            disabled={moveTargetId === '' || !moveRange.trim()}
            className="px-3 py-1 rounded text-xs disabled:opacity-40"
            style={{ background: '#1a3a1a', color: '#4a9a4a' }}
          >
            Move
          </button>
          <button
            onClick={() => setMoveOpen(false)}
            className="px-2 py-1 rounded text-xs"
            style={{ color: '#666' }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
