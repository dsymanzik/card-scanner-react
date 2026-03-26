import { useState } from 'react'
import type { ScryfallSuggestion } from '../types'

interface SuggestionListProps {
  suggestions: ScryfallSuggestion[]
  cardId: number
  onSelect: (suggestion: ScryfallSuggestion) => void
  onResolveScryfall: (cardId: number, identifier: string) => Promise<void>
  onPhotoClick: (src: string, label: string) => void
}

function confidenceColor(confidence: number): string {
  if (confidence > 0.8) return 'text-[#4a9a4a]'
  if (confidence > 0.5) return 'text-[#cc9944]'
  return 'text-[#888]'
}

export default function SuggestionList({
  suggestions,
  cardId,
  onSelect,
  onResolveScryfall,
}: SuggestionListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [pasteValue, setPasteValue] = useState('')
  const [pasteError, setPasteError] = useState<string | null>(null)
  const [pasteLoading, setPasteLoading] = useState(false)

  const handleSearchOpen = () => {
    const q = searchQuery.trim()
    if (!q) return
    window.open(`https://scryfall.com/search?q=${encodeURIComponent(q)}`, '_blank', 'noopener')
  }

  const handleUse = async () => {
    const identifier = pasteValue.trim()
    if (!identifier) return
    setPasteError(null)
    setPasteLoading(true)
    try {
      await onResolveScryfall(cardId, identifier)
      setPasteValue('')
    } catch (e) {
      setPasteError(e instanceof Error ? e.message : 'Failed to resolve card')
    } finally {
      setPasteLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[#aaa] text-sm font-semibold uppercase tracking-wide">
        Suggestions
      </h3>

      {suggestions.length === 0 && (
        <p className="text-[#666] text-sm italic">No suggestions available</p>
      )}

      <div className="flex flex-col gap-1.5">
        {suggestions.map((s, i) => (
          <div
            key={s.scryfall_id}
            className={`flex items-center gap-3 rounded p-2 ${
              i === 0 ? 'bg-[#1a2a3a]' : 'bg-[#1e1e1e]'
            }`}
          >
            {/* Thumbnail */}
            {s.image_url ? (
              <img
                src={s.image_url}
                alt={s.name}
                className="w-10 h-14 object-cover rounded flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-14 bg-[#2a2a2a] rounded flex-shrink-0 flex items-center justify-center text-[#555] text-xs">
                ?
              </div>
            )}

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="text-[#ddd] text-sm font-medium truncate">{s.name}</div>
              <div className="text-[#888] text-xs truncate">
                {s.set_code.toUpperCase()} · {s.type_line}
              </div>
              <div className={`text-xs font-mono ${confidenceColor(s.confidence)}`}>
                {(s.confidence * 100).toFixed(0)}%
              </div>
            </div>

            {/* Select */}
            <button
              type="button"
              onClick={() => onSelect(s)}
              className="px-2.5 py-1 rounded bg-[#2a3a4a] text-[#7ab0cc] text-xs hover:bg-[#3a4a5a] transition-colors flex-shrink-0"
            >
              Select
            </button>
          </div>
        ))}
      </div>

      {/* Manual search */}
      <div className="mt-1 border-t border-[#2a2a2a] pt-3">
        <div className="text-[#888] text-xs mb-1.5">Manual search on Scryfall</div>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearchOpen()}
            placeholder="Card name..."
            className="flex-1 px-2 py-1 rounded bg-[#1e1e1e] border border-[#333] text-[#ccc] text-sm focus:outline-none focus:border-[#4a7a9a]"
          />
          <button
            type="button"
            onClick={handleSearchOpen}
            className="px-3 py-1 rounded bg-[#2a2a2a] text-[#7ab0cc] text-sm hover:bg-[#3a3a3a] transition-colors whitespace-nowrap"
          >
            ↗ Search
          </button>
        </div>
      </div>

      {/* Paste URL / UUID */}
      <div className="border-t border-[#2a2a2a] pt-3">
        <div className="text-[#888] text-xs mb-1.5">Paste Scryfall URL or UUID</div>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={pasteValue}
            onChange={e => { setPasteValue(e.target.value); setPasteError(null) }}
            onKeyDown={e => e.key === 'Enter' && handleUse()}
            placeholder="https://scryfall.com/... or UUID"
            className="flex-1 px-2 py-1 rounded bg-[#1e1e1e] border border-[#333] text-[#ccc] text-sm focus:outline-none focus:border-[#4a7a9a]"
          />
          <button
            type="button"
            onClick={handleUse}
            disabled={pasteLoading}
            className="px-3 py-1 rounded bg-[#2a3a2a] text-[#4a9a4a] text-sm hover:bg-[#3a4a3a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {pasteLoading ? '...' : 'Use'}
          </button>
        </div>
        {pasteError && (
          <p className="text-[#cc5555] text-xs mt-1">{pasteError}</p>
        )}
      </div>
    </div>
  )
}
