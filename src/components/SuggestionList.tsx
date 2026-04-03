import { useState, useEffect } from 'react'
import type { Card } from '../types'

interface SuggestionListProps {
  suggestions: Card[]
  matchedCard: Card | null
  matchedScryfallId: string | null
  suggestionOverridden: boolean
  cardId: number
  onSelect: (scryfallId: string) => void
  onSelectFromUrl: (identifier: string) => void
  onSearch: (name: string, set?: string, cn?: string) => Promise<Card[]>
  onPhotoClick: (src: string, label: string) => void
}

function confidenceColor(confidence: number): string {
  if (confidence > 0.8) return 'text-[#4a9a4a]'
  if (confidence > 0.5) return 'text-[#cc9944]'
  return 'text-[#888]'
}

function MagnifyOverlay({ src, onPhotoClick, label }: { src: string; onPhotoClick: (src: string, label: string) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onPhotoClick(src, label) }}
      className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded"
      aria-label="View larger"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="1.5">
        <circle cx="7" cy="7" r="4.5" />
        <path d="M10.5 10.5L14 14" />
        <path d="M7 5v4M5 7h4" />
      </svg>
    </button>
  )
}

export default function SuggestionList({
  suggestions,
  matchedCard,
  matchedScryfallId,
  suggestionOverridden,
  cardId,
  onSelect,
  onSelectFromUrl,
  onSearch,
  onPhotoClick,
}: SuggestionListProps) {
  const topSuggestion = suggestions[0] ?? null

  const [searchName, setSearchName] = useState('')
  const [searchSet, setSearchSet] = useState('')
  const [searchNumber, setSearchNumber] = useState('')
  const [searchResults, setSearchResults] = useState<Card[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const [pasteValue, setPasteValue] = useState('')
  const [pasteError, setPasteError] = useState<string | null>(null)
  const [pasteLoading, setPasteLoading] = useState(false)

  useEffect(() => {
    const prefill = topSuggestion
    if (prefill) {
      setSearchName(prefill.name)
      setSearchSet(prefill.set_code.toUpperCase())
      setSearchNumber(prefill.collector_number)
    } else {
      setSearchName('')
      setSearchSet('')
      setSearchNumber('')
    }
    setSearchResults([])
    setSearchError(null)
    setPasteValue('')
    setPasteError(null)
    setPasteLoading(false)
  }, [cardId])

  const handleSearch = async () => {
    const name = searchName.trim()
    if (!name) return
    setSearchLoading(true)
    setSearchError(null)
    setSearchResults([])
    try {
      const results = await onSearch(name, searchSet.trim() || undefined, searchNumber.trim() || undefined)
      setSearchResults(results)
      if (results.length === 0) {
        setSearchError('No results found')
      }
    } catch (e) {
      setSearchError(e instanceof Error ? e.message : 'Search failed')
    } finally {
      setSearchLoading(false)
    }
  }

  const handleUse = async () => {
    const identifier = pasteValue.trim()
    if (!identifier) return
    setPasteError(null)
    setPasteLoading(true)
    try {
      await onSelectFromUrl(identifier)
      setPasteValue('')
    } catch (e) {
      setPasteError(e instanceof Error ? e.message : 'Failed to resolve card')
    } finally {
      setPasteLoading(false)
    }
  }

  const showManualMatch = suggestionOverridden && matchedCard !== null

  return (
    <div className="flex flex-col gap-4">

      {/* Search section */}
      <div>
        <h3 className="text-[#888] text-xs font-semibold uppercase tracking-wide mb-2">
          Search Scryfall
        </h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Card name"
            className="flex-1 px-2 py-1.5 rounded bg-[#1e1e1e] border border-[#333] text-[#ccc] text-sm focus:outline-none focus:border-[#4a7a9a]"
          />
          <input
            type="text"
            value={searchSet}
            onChange={e => setSearchSet(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Set"
            className="w-20 px-2 py-1.5 rounded bg-[#1e1e1e] border border-[#333] text-[#ccc] text-sm focus:outline-none focus:border-[#4a7a9a] uppercase"
          />
          <input
            type="text"
            value={searchNumber}
            onChange={e => setSearchNumber(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="#"
            className="w-16 px-2 py-1.5 rounded bg-[#1e1e1e] border border-[#333] text-[#ccc] text-sm focus:outline-none focus:border-[#4a7a9a]"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={searchLoading || !searchName.trim()}
            className="px-3 py-1.5 rounded bg-[#2a3a4a] text-[#7ab0cc] text-sm hover:bg-[#3a4a5a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {searchLoading ? '...' : '\u2197 Search'}
          </button>
        </div>

        {/* Paste URL / UUID */}
        <div className="flex gap-1.5 mt-2">
          <input
            type="text"
            value={pasteValue}
            onChange={e => { setPasteValue(e.target.value); setPasteError(null) }}
            onKeyDown={e => e.key === 'Enter' && handleUse()}
            placeholder="Paste Scryfall URL or UUID..."
            className="flex-1 px-2 py-1 rounded bg-[#1a1a1a] border border-[#2a2a2a] text-[#999] text-xs focus:outline-none focus:border-[#4a7a9a] focus:text-[#ccc]"
          />
          <button
            type="button"
            onClick={handleUse}
            disabled={pasteLoading || !pasteValue.trim()}
            className="px-3 py-1 rounded bg-[#2a3a2a] text-[#4a9a4a] text-xs hover:bg-[#3a4a3a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {pasteLoading ? '...' : 'Use'}
          </button>
        </div>
        {pasteError && (
          <p className="text-[#cc5555] text-xs mt-1">{pasteError}</p>
        )}

        {searchError && (
          <p className="text-[#cc5555] text-xs mt-2">{searchError}</p>
        )}

        {/* Search Results — one-click select */}
        {searchResults.length > 0 && (
          <div className="mt-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#4a4a4a #1e1e1e' }}>
            <div className="flex gap-3" style={{ minWidth: 'min-content' }}>
              {searchResults.map((result) => (
                <button
                  key={result.scryfall_id}
                  type="button"
                  onClick={() => onSelect(result.scryfall_id)}
                  className="flex flex-col rounded overflow-hidden transition-all text-left group shrink-0 bg-[#1e1e1e] hover:bg-[#282828]"
                  style={{ width: 140 }}
                >
                  <div className="relative aspect-[488/680] w-full">
                    {result.image_url ? (
                      <>
                        <img src={result.image_url} alt={result.name} className="w-full h-full object-cover" />
                        <MagnifyOverlay src={result.image_url} onPhotoClick={onPhotoClick} label={result.name} />
                      </>
                    ) : (
                      <div className="w-full h-full bg-[#2a2a2a] flex items-center justify-center text-[#555] text-xs">No image</div>
                    )}
                  </div>
                  <div className="p-2">
                    <div className="text-[#ccc] text-xs font-medium truncate">{result.name}</div>
                    <div className="text-[#888] text-[10px] truncate">{result.set_code.toUpperCase()} #{result.collector_number}</div>
                    <div className="text-[#666] text-[10px] truncate">{result.rarity}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Manual Match section */}
      {showManualMatch && matchedCard && (
        <div>
          <h3 className="text-[#7ab0cc] text-sm font-bold uppercase tracking-wide mb-2">
            Manual Match
          </h3>
          <div className="flex items-center gap-3 rounded p-2 bg-[#1a2a3a] border-2 border-[#3a6a9a] overflow-hidden">
            <div className="relative w-10 h-14 flex-shrink-0 group">
              {matchedCard.image_url ? (
                <>
                  <img src={matchedCard.image_url} alt={matchedCard.name} className="w-full h-full object-cover rounded" />
                  <MagnifyOverlay src={matchedCard.image_url} onPhotoClick={onPhotoClick} label={matchedCard.name} />
                </>
              ) : (
                <div className="w-full h-full bg-[#2a2a2a] rounded flex items-center justify-center text-[#555] text-xs">?</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[#ddd] text-sm font-medium truncate">{matchedCard.name}</div>
              <div className="text-[#88aacc] text-xs truncate">
                {matchedCard.set_code.toUpperCase()} #{matchedCard.collector_number} · {matchedCard.type_line}
              </div>
            </div>
            <span className="px-2.5 py-1 rounded bg-[#2a4a6a] text-[#7ab0cc] text-xs shrink-0 font-medium">
              Selected
            </span>
          </div>
        </div>
      )}

      {/* Suggestions section */}
      <div>
        <h3 className="text-[#777] text-xs font-semibold uppercase tracking-wide mb-2">
          Suggestions
        </h3>

        {suggestions.length === 0 && (
          <p className="text-[#666] text-sm italic">No suggestions available</p>
        )}

        <div className="flex flex-col gap-1.5">
          {suggestions.map((s) => {
            const isSelected = s.scryfall_id === matchedScryfallId
            const confidence = s.confidence ?? 0
            return (
              <div
                key={s.scryfall_id}
                className={`flex items-center gap-3 rounded p-2 transition-colors cursor-pointer overflow-hidden ${
                  isSelected
                    ? 'bg-[#1a2a3a] border border-[#2a4a6a] hover:bg-[#1e3040]'
                    : 'bg-[#1e1e1e] border border-transparent hover:bg-[#282828]'
                }`}
                onClick={() => onSelect(s.scryfall_id)}
              >
                <div className="relative w-10 h-14 flex-shrink-0 group">
                  {s.image_url ? (
                    <>
                      <img src={s.image_url} alt={s.name} className="w-full h-full object-cover rounded" />
                      <MagnifyOverlay src={s.image_url} onPhotoClick={onPhotoClick} label={s.name} />
                    </>
                  ) : (
                    <div className="w-full h-full bg-[#2a2a2a] rounded flex items-center justify-center text-[#555] text-xs">?</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[#ddd] text-sm font-medium truncate">{s.name}</div>
                  <div className="text-[#888] text-xs truncate">
                    {s.set_code.toUpperCase()} #{s.collector_number} · {s.type_line}
                  </div>
                  <div className={`text-xs font-mono ${confidenceColor(confidence)}`}>
                    {(confidence * 100).toFixed(0)}%
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onSelect(s.scryfall_id) }}
                  className={`px-2.5 py-1 rounded text-xs transition-colors shrink-0 ${
                    isSelected
                      ? 'bg-[#2a4a6a] text-[#7ab0cc] font-medium'
                      : 'bg-[#2a3a4a] text-[#7ab0cc] hover:bg-[#3a4a5a]'
                  }`}
                >
                  {isSelected ? 'Selected' : 'Select'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
