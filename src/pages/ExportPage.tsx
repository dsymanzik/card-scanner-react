import { useEffect, useState } from 'react'
import { useBoxesStore } from '../stores/boxesStore'
import { useCardsStore } from '../stores/cardsStore'
import type { ExportFormat } from '../types'
import { generateCSV, downloadCSV } from '../utils/csv'

const FORMAT_OPTIONS: { value: ExportFormat; label: string }[] = [
  { value: 'moxfield', label: 'Moxfield' },
  { value: 'deckbox', label: 'Deckbox' },
  { value: 'tcgplayer', label: 'TCGPlayer' },
  { value: 'generic', label: 'Generic (all fields)' },
]

export default function ExportPage() {
  const { boxes, fetchBoxes } = useBoxesStore()
  const { cards, fetchCards } = useCardsStore()

  const [scope, setScope] = useState<'all' | 'box'>('all')
  const [selectedBoxId, setSelectedBoxId] = useState<number | ''>('')
  const [onlyReviewed, setOnlyReviewed] = useState(false)
  const [format, setFormat] = useState<ExportFormat>('moxfield')

  useEffect(() => {
    fetchBoxes()
    fetchCards()
  }, [fetchBoxes, fetchCards])

  const totalCards = cards.length

  const filteredCards = cards.filter((card) => {
    if (scope === 'box' && selectedBoxId !== '') {
      if (card.box_id !== selectedBoxId) return false
    }
    if (onlyReviewed && !card.reviewed) return false
    return true
  })

  const boxNameMap: Record<number, string> = {}
  for (const box of boxes) {
    boxNameMap[box.id] = box.name
  }

  const selectedBox = boxes.find((b) => b.id === selectedBoxId)

  const handleDownload = () => {
    const csv = generateCSV(filteredCards, format, boxNameMap)
    if (!csv) return
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const scopeLabel = scope === 'box' && selectedBox ? selectedBox.name.replace(/\s+/g, '_') : 'all'
    const filename = `cardscanner_${scopeLabel}_${dateStr}.csv`
    downloadCSV(csv, filename)
  }

  const canDownload = filteredCards.length > 0 && (scope === 'all' || selectedBoxId !== '')

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-semibold mb-6" style={{ color: '#ccc' }}>
        Export Collection
      </h1>

      {/* Scope + Filter panel */}
      <div className="rounded mb-4" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
        {/* Scope section */}
        <div className="p-4">
          <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: '#888' }}>
            Scope
          </p>

          <label className="flex items-center gap-2 mb-2 cursor-pointer">
            <input
              type="radio"
              name="scope"
              value="all"
              checked={scope === 'all'}
              onChange={() => setScope('all')}
              className="accent-[#4a9a4a]"
            />
            <span className="text-sm" style={{ color: '#ccc' }}>
              All boxes{' '}
              <span style={{ color: '#666' }}>({totalCards} cards)</span>
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="scope"
              value="box"
              checked={scope === 'box'}
              onChange={() => setScope('box')}
              className="accent-[#4a9a4a]"
            />
            <span className="text-sm" style={{ color: '#ccc' }}>
              Specific box:
            </span>
            <select
              value={selectedBoxId}
              onChange={(e) =>
                setSelectedBoxId(e.target.value === '' ? '' : Number(e.target.value))
              }
              disabled={scope !== 'box'}
              className="px-2 py-1 rounded text-sm outline-none disabled:opacity-40"
              style={{ background: '#2a2a2a', border: '1px solid #3a3a3a', color: '#ccc' }}
            >
              <option value="">Select box...</option>
              {boxes.map((box) => (
                <option key={box.id} value={box.id}>
                  {box.name} ({box.total} cards)
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid #2a2a2a' }} />

        {/* Filter section */}
        <div className="p-4">
          <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: '#888' }}>
            Filter
          </p>

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyReviewed}
              onChange={(e) => setOnlyReviewed(e.target.checked)}
              className="mt-0.5 accent-[#4a9a4a]"
            />
            <div>
              <span className="text-sm" style={{ color: '#ccc' }}>
                Only reviewed cards
              </span>
              <p className="text-xs mt-0.5" style={{ color: '#666' }}>
                Excludes cards that have not been manually confirmed
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Format panel */}
      <div className="rounded mb-6" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
        <div className="p-4">
          <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: '#888' }}>
            Format
          </p>

          <div className="flex flex-col gap-2">
            {FORMAT_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value={opt.value}
                  checked={format === opt.value}
                  onChange={() => setFormat(opt.value)}
                  className="accent-[#4a9a4a]"
                />
                <span className="text-sm" style={{ color: '#ccc' }}>
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Download row */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleDownload}
          disabled={!canDownload}
          className="px-5 py-2 rounded text-sm font-medium disabled:opacity-40"
          style={{ background: '#1a3a1a', color: '#4a9a4a', border: '1px solid #2a4a2a' }}
        >
          Download CSV
        </button>
        <span className="text-sm" style={{ color: '#666' }}>
          {filteredCards.length} card{filteredCards.length !== 1 ? 's' : ''} total
        </span>
      </div>
    </div>
  )
}
