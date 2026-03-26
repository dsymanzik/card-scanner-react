import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

import { useBoxesStore } from '../stores/boxesStore'
import { useCardsStore } from '../stores/cardsStore'
import { CONDITIONS } from '../types'
import type { ScryfallSuggestion } from '../types'
import Badge from '../components/Badge'
import PhotoStrip from '../components/PhotoStrip'
import ReviewNav from '../components/ReviewNav'
import SuggestionList from '../components/SuggestionList'
import CardDetail from '../components/CardDetail'

export default function ReviewPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const boxIdParam = searchParams.get('box_id')
  const posParam = searchParams.get('pos')
  const boxId = boxIdParam ? parseInt(boxIdParam, 10) : null
  const pos = posParam ? parseInt(posParam, 10) : 1

  // Lightbox state
  const [lbOpen, setLbOpen] = useState(false)
  const [lbSlides, setLbSlides] = useState<{ src: string }[]>([])
  const [lbIndex, setLbIndex] = useState(0)

  const { boxes, fetchBoxes } = useBoxesStore()
  const {
    cards,
    currentCard,
    matchedCache,
    fetchCards,
    fetchCard,
    updateCard,
    setMatchFromScryfall,
    clearCurrentCard,
  } = useCardsStore()

  // Fetch boxes on mount
  useEffect(() => {
    fetchBoxes()
  }, [fetchBoxes])

  // When box changes, fetch cards for that box
  const currentBox = boxes.find(b => b.id === boxId) ?? null

  useEffect(() => {
    if (currentBox) {
      fetchCards(currentBox.name)
    }
  }, [currentBox, fetchCards])

  // Sort cards by position
  const sortedCards = [...cards].sort((a, b) => a.position - b.position)

  // Find card at current position
  const card = sortedCards.find(c => c.position === pos) ?? null

  // Prev / next positions
  const currentIndex = card ? sortedCards.indexOf(card) : -1
  const prevCard = currentIndex > 0 ? sortedCards[currentIndex - 1] : null
  const nextCard = currentIndex >= 0 && currentIndex < sortedCards.length - 1
    ? sortedCards[currentIndex + 1]
    : null
  const prevPos = prevCard?.position ?? null
  const nextPos = nextCard?.position ?? null

  // Fetch full card data when card id changes
  useEffect(() => {
    if (card) {
      fetchCard(card.id)
    } else {
      clearCurrentCard()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card?.id])

  // Box selector change handler
  const handleBoxChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBoxId = parseInt(e.target.value, 10)
    navigate(`/review?box_id=${newBoxId}&pos=1`)
  }

  // Lightbox helpers
  const openLightbox = (src: string, _label: string) => {
    const photoSlides = (currentCard?.photo_urls ?? []).map(u => ({ src: u }))
    const cardImageSlide = matchedCache?.image_url ? [{ src: matchedCache.image_url }] : []
    const allSlides = [...photoSlides, ...cardImageSlide]
    const idx = allSlides.findIndex(s => s.src === src)
    setLbSlides(allSlides.length > 0 ? allSlides : [{ src }])
    setLbIndex(idx >= 0 ? idx : 0)
    setLbOpen(true)
  }

  // Foil override handling — 3-state: detected → override opposite → back to null
  const foilEffective = currentCard
    ? (currentCard.foil_user_override !== null ? currentCard.foil_user_override : currentCard.foil_detected)
    : false
  const foilOverridden = currentCard != null && currentCard.foil_user_override !== null

  const handleFoilToggle = async () => {
    if (!currentCard) return
    if (currentCard.foil_user_override === null) {
      await updateCard(currentCard.id, { foil_user_override: !currentCard.foil_detected })
    } else {
      await updateCard(currentCard.id, { foil_user_override: null })
    }
  }

  // Condition handler
  const handleConditionChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!currentCard) return
    const val = e.target.value || null
    await updateCard(currentCard.id, { condition: val })
  }

  // Select suggestion
  const handleSelectSuggestion = async (suggestion: ScryfallSuggestion) => {
    if (!currentCard) return
    const topSuggestionId = currentCard.scryfall_suggestions[0]?.scryfall_id ?? null
    const overridden = topSuggestionId !== null && suggestion.scryfall_id !== topSuggestionId
    await updateCard(currentCard.id, {
      matched_scryfall_id: suggestion.scryfall_id,
      ...(overridden ? { suggestion_overridden: true } : {}),
    })
  }

  // Resolve scryfall from URL/UUID
  const handleResolveScryfall = async (cardId: number, identifier: string) => {
    await setMatchFromScryfall(cardId, identifier)
  }

  // Reviewed + Next
  const handleReviewedNext = async () => {
    if (!currentCard) return
    await updateCard(currentCard.id, { reviewed: true })
    if (nextPos !== null && boxId !== null) {
      navigate(`/review?box_id=${boxId}&pos=${nextPos}`)
    }
  }

  // Toggle reviewed
  const handleToggleReviewed = async () => {
    if (!currentCard) return
    await updateCard(currentCard.id, { reviewed: !currentCard.reviewed })
  }

  // Unreviewed count for current box
  const unreviewedCount = currentBox?.unreviewed ?? 0

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header row: box selector + counts */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={boxId ?? ''}
          onChange={handleBoxChange}
          className="px-3 py-1.5 rounded bg-[#1e1e1e] border border-[#333] text-[#ccc] text-sm focus:outline-none focus:border-[#4a7a9a]"
        >
          <option value="" disabled>Select box…</option>
          {boxes.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        {currentBox && (
          <>
            <Badge variant={unreviewedCount > 0 ? 'warn' : 'ok'}>
              {unreviewedCount} unreviewed
            </Badge>
            <Badge variant="default">
              {currentBox.total} total
            </Badge>
          </>
        )}
      </div>

      {/* Navigation bar */}
      {boxId !== null && currentCard && (
        <ReviewNav
          boxId={boxId}
          pos={pos}
          total={sortedCards.length}
          prevPos={prevPos}
          nextPos={nextPos}
          reviewed={currentCard.reviewed}
          cardId={currentCard.id}
          onReviewedNext={handleReviewedNext}
          onToggleReviewed={handleToggleReviewed}
        />
      )}

      {/* No box selected */}
      {boxId === null && (
        <div className="text-[#888] text-sm italic mt-4">Select a box to begin reviewing.</div>
      )}

      {/* No card found */}
      {boxId !== null && !card && (
        <div className="text-[#888] text-sm italic mt-4">No card found at position {pos}.</div>
      )}

      {/* Main content: two-column */}
      {currentCard && (
        <div className="flex gap-6 flex-1 min-h-0">
          {/* Left column: 300px */}
          <div className="flex flex-col gap-4" style={{ width: 300, flexShrink: 0 }}>
            <PhotoStrip
              photoUrls={currentCard.photo_urls}
              onPhotoClick={openLightbox}
            />

            {/* Foil toggle */}
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={handleFoilToggle}
                className={`px-3 py-1.5 rounded text-sm transition-colors text-left ${
                  foilEffective
                    ? 'bg-[#2a2a1a] text-[#cc9944] hover:bg-[#3a3a1a]'
                    : 'bg-[#2a2a2a] text-[#888] hover:bg-[#3a3a3a]'
                }`}
              >
                {foilEffective ? '✦ Foil' : '◇ Non-foil'}
                {foilOverridden && (
                  <span className="ml-2 text-xs text-[#666]">(overridden)</span>
                )}
              </button>
              <div className="text-[#555] text-xs">
                Detected: {currentCard.foil_detected ? 'foil' : 'non-foil'}
              </div>
            </div>

            {/* Condition dropdown */}
            <div className="flex flex-col gap-1">
              <label className="text-[#666] text-xs">Condition</label>
              <select
                value={currentCard.condition ?? ''}
                onChange={handleConditionChange}
                className="px-2 py-1.5 rounded bg-[#1e1e1e] border border-[#333] text-[#ccc] text-sm focus:outline-none focus:border-[#4a7a9a]"
              >
                <option value="">— Not set —</option>
                {CONDITIONS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6 flex-1 min-w-0 overflow-y-auto">
            <SuggestionList
              suggestions={currentCard.scryfall_suggestions}
              cardId={currentCard.id}
              onSelect={handleSelectSuggestion}
              onResolveScryfall={handleResolveScryfall}
              onPhotoClick={openLightbox}
            />

            {matchedCache && (
              <div className="border-t border-[#2a2a2a] pt-4">
                <h3 className="text-[#aaa] text-sm font-semibold uppercase tracking-wide mb-3">
                  Matched Card
                </h3>
                <CardDetail card={matchedCache} onPhotoClick={openLightbox} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lightbox */}
      <Lightbox
        open={lbOpen}
        close={() => setLbOpen(false)}
        slides={lbSlides}
        index={lbIndex}
      />
    </div>
  )
}
