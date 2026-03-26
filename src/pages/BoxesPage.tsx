import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useBoxesStore } from '../stores/boxesStore'
import { useCardsStore } from '../stores/cardsStore'
import Badge from '../components/Badge'
import { parseRange } from '../utils/parseRange'
import type { Box } from '../types'

export default function BoxesPage() {
  const { boxes, loading, error, fetchBoxes, createBox, renameBox, mergeBox } = useBoxesStore()
  const { cards, fetchCards, moveCards } = useCardsStore()

  const [newBoxName, setNewBoxName] = useState('')

  useEffect(() => {
    fetchBoxes()
    fetchCards()
  }, [fetchBoxes, fetchCards])

  const handleCreateBox = async () => {
    const name = newBoxName.trim()
    if (!name) return
    await createBox(name)
    setNewBoxName('')
  }

  if (loading && boxes.length === 0) {
    return (
      <div className="p-6" style={{ color: '#888' }}>
        Loading boxes...
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold" style={{ color: '#ccc' }}>
          Your Boxes
        </h1>
      </div>

      {/* New Box form */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="New box name..."
          value={newBoxName}
          onChange={(e) => setNewBoxName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreateBox()}
          className="flex-1 px-3 py-1.5 rounded text-sm outline-none"
          style={{
            background: '#2a2a2a',
            border: '1px solid #3a3a3a',
            color: '#ccc',
          }}
        />
        <button
          onClick={handleCreateBox}
          disabled={!newBoxName.trim()}
          className="px-4 py-1.5 rounded text-sm font-medium disabled:opacity-40"
          style={{ background: '#3a3a3a', color: '#ccc' }}
        >
          Create
        </button>
      </div>

      {error && (
        <p className="mb-4 text-sm" style={{ color: '#cc5555' }}>
          {error}
        </p>
      )}

      {/* Box list */}
      {boxes.length === 0 ? (
        <p className="text-sm" style={{ color: '#666' }}>
          No boxes yet. Create one above.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
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
    <div
      className="rounded p-4 flex flex-col gap-3"
      style={{ background: '#2a2a2a', border: '1px solid #3a3a3a' }}
    >
      {/* Top row: name link + counts */}
      <div className="flex items-center gap-3">
        <Link
          to={`/review?box_id=${box.id}`}
          className="font-medium hover:underline"
          style={{ color: '#ccc' }}
        >
          {box.name}
        </Link>
        <Badge variant="default">{box.total} cards</Badge>
        {box.unreviewed > 0 && (
          <Badge variant="warn">{box.unreviewed} unreviewed</Badge>
        )}
      </div>

      {/* Rename */}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleRename()}
          className="px-2 py-1 rounded text-sm outline-none"
          style={{
            background: '#1a1a1a',
            border: '1px solid #3a3a3a',
            color: '#ccc',
            width: '200px',
          }}
        />
        <button
          onClick={handleRename}
          disabled={!renameValue.trim() || renameValue.trim() === box.name}
          className="px-3 py-1 rounded text-xs disabled:opacity-40"
          style={{ background: '#3a3a3a', color: '#ccc' }}
        >
          Rename
        </button>
      </div>

      {/* Merge + Move toggles */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => { setMergeOpen((o) => !o); setMoveOpen(false) }}
          className="px-3 py-1 rounded text-xs"
          style={{ background: '#3a3a3a', color: '#888' }}
        >
          Merge into...
        </button>
        <button
          onClick={() => { setMoveOpen((o) => !o); setMergeOpen(false) }}
          className="px-3 py-1 rounded text-xs"
          style={{ background: '#3a3a3a', color: '#888' }}
        >
          Move cards...
        </button>
      </div>

      {/* Merge panel */}
      {mergeOpen && (
        <div className="flex gap-2 items-center flex-wrap pl-1">
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
        <div className="flex gap-2 items-center flex-wrap pl-1">
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
