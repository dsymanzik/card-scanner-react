import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

import { useBoxesStore } from '../stores/boxesStore'
import { getReview, updateReviewCard, selectMatch, searchReview } from '../api/review'
import { CONDITIONS } from '../types'
import type { ReviewResponse, ScryfallCard } from '../types'
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

  const [reviewData, setReviewData] = useState<ReviewResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [lbOpen, setLbOpen] = useState(false)
  const [lbSlides, setLbSlides] = useState<{ src: string }[]>([])
  const [lbIndex, setLbIndex] = useState(0)

  const { boxes, fetchBoxes } = useBoxesStore()

  useEffect(() => { fetchBoxes() }, [fetchBoxes])

  useEffect(() => {
    if (boxId === null && boxes.length > 0) {
      navigate(`/review?box_id=${boxes[0].id}&pos=1`, { replace: true })
    }
  }, [boxId, boxes, navigate])

  useEffect(() => {
    if (boxId === null) return
    let cancelled = false
    setLoading(true)
    setError(null)
    getReview(boxId, pos)
      .then((data) => { if (!cancelled) setReviewData(data) })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load review') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [boxId, pos])

  const card = reviewData?.card ?? null
  const nav = reviewData?.nav ?? null
  const box = reviewData?.box ?? null

  const handleBoxChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    navigate(`/review?box_id=${parseInt(e.target.value, 10)}&pos=1`)
  }

  const openLightbox = (src: string, _label: string) => {
    const largeSrc = src.includes('scryfall.io') ? src.replace('/normal/', '/large/') : src
    setLbSlides([{ src: largeSrc }])
    setLbIndex(0)
    setLbOpen(true)
  }

  const foilEffective = card
    ? (card.foil_user_override ?? card.foil_detected)
    : false
  const foilOverridden = card != null && card.foil_user_override !== null

  const handleFoilToggle = async () => {
    if (!card) return
    const newOverride = card.foil_user_override === null
      ? !card.foil_detected
      : null
    const data = await updateReviewCard(card.id, { foil_user_override: newOverride })
    setReviewData(data)
  }

  const handleConditionChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!card) return
    const data = await updateReviewCard(card.id, { condition: e.target.value || null })
    setReviewData(data)
  }

  const handleSelectSuggestion = useCallback(async (scryfallId: string) => {
    if (!card) return
    const data = await selectMatch(card.id, scryfallId)
    setReviewData(data)
  }, [card])

  const handleSearch = useCallback(async (name: string, set?: string, cn?: string): Promise<ScryfallCard[]> => {
    return searchReview(name, set, cn)
  }, [])

  const handleReviewedNext = async () => {
    if (!card) return
    const data = await updateReviewCard(card.id, { reviewed: true })
    setReviewData(data)
    const nextPos = data.nav.next_pos
    if (nextPos !== null && boxId !== null) {
      navigate(`/review?box_id=${boxId}&pos=${nextPos}`)
    }
  }

  const handleToggleReviewed = async () => {
    if (!card) return
    const data = await updateReviewCard(card.id, { reviewed: !card.reviewed })
    setReviewData(data)
  }

  return (
    <div className="flex flex-col gap-4 h-full overflow-x-hidden">
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={boxId ?? ''}
          onChange={handleBoxChange}
          className="px-3 py-1.5 rounded bg-[#1e1e1e] border border-[#333] text-[#ccc] text-sm focus:outline-none focus:border-[#4a7a9a]"
        >
          <option value="" disabled>Select box...</option>
          {boxes.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        {box && (
          <>
            <Badge variant={box.unreviewed > 0 ? 'warn' : 'ok'}>
              {box.unreviewed} unreviewed
            </Badge>
            <Badge variant="default">
              {box.total} total
            </Badge>
          </>
        )}
      </div>

      {boxId !== null && nav && card && (
        <ReviewNav
          boxId={boxId}
          pos={nav.pos}
          total={nav.total}
          prevPos={nav.prev_pos}
          nextPos={nav.next_pos}
          nextUnreviewedPos={nav.next_unreviewed_pos}
          reviewed={card.reviewed}
          cardId={card.id}
          onReviewedNext={handleReviewedNext}
          onToggleReviewed={handleToggleReviewed}
        />
      )}

      {boxId === null && (
        <div className="text-[#888] text-sm italic mt-4">Select a box to begin reviewing.</div>
      )}

      {loading && (
        <div className="text-[#888] text-sm italic mt-4">Loading...</div>
      )}

      {error && (
        <div className="text-[#cc5555] text-sm mt-4">{error}</div>
      )}

      {boxId !== null && !loading && !card && !error && (
        <div className="text-[#888] text-sm italic mt-4">No card found at position {pos}.</div>
      )}

      {card && (
        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
          <div className="flex flex-col gap-4 lg:w-[380px] lg:flex-shrink-0">
            <PhotoStrip
              photoUrls={card.photo_urls}
              onPhotoClick={openLightbox}
            />

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
                {foilEffective ? '\u2726 Foil' : '\u25C7 Non-foil'}
                {foilOverridden && (
                  <span className="ml-2 text-xs text-[#666]">(overridden)</span>
                )}
              </button>
              <div className="text-[#555] text-xs">
                Detected: {card.foil_detected ? 'foil' : 'non-foil'}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[#666] text-xs">Condition</label>
              <select
                value={card.condition ?? ''}
                onChange={handleConditionChange}
                className="px-2 py-1.5 rounded bg-[#1e1e1e] border border-[#333] text-[#ccc] text-sm focus:outline-none focus:border-[#4a7a9a]"
              >
                <option value="">-- Not set --</option>
                {CONDITIONS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-4 flex-1 min-w-0 overflow-y-auto">
            {card.matched_card && (
              <div>
                <h3 className="text-[#eee] text-sm font-bold uppercase tracking-wide mb-2">
                  Matched Card
                </h3>
                <CardDetail card={card.matched_card} onPhotoClick={openLightbox} />
              </div>
            )}

            <SuggestionList
              suggestions={card.suggestions}
              matchedCard={card.matched_card}
              matchedScryfallId={card.matched_card?.scryfall_id ?? null}
              suggestionOverridden={card.suggestion_overridden}
              cardId={card.id}
              onSelect={handleSelectSuggestion}
              onSearch={handleSearch}
              onPhotoClick={openLightbox}
            />
          </div>
        </div>
      )}

      <Lightbox
        open={lbOpen}
        close={() => setLbOpen(false)}
        slides={lbSlides}
        index={lbIndex}
      />
    </div>
  )
}
