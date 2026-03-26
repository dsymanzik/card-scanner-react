import { create } from 'zustand'
import type { Card, CardPatch, ScryfallCard } from '../types'
import * as cardsApi from '../api/cards'
import * as scryfallApi from '../api/scryfall'

interface CardsState {
  cards: Card[]
  currentCard: Card | null
  matchedCache: ScryfallCard | null
  loading: boolean
  error: string | null
  fetchCards: (boxName?: string) => Promise<void>
  fetchCard: (cardId: number) => Promise<void>
  updateCard: (cardId: number, fields: CardPatch) => Promise<void>
  moveCards: (cardIds: number[], targetBoxId: number) => Promise<void>
  setMatchFromScryfall: (cardId: number, identifier: string) => Promise<{ name: string }>
  loadMatchedCache: (scryfallId: string) => Promise<void>
  clearCurrentCard: () => void
}

export const useCardsStore = create<CardsState>((set, get) => ({
  cards: [],
  currentCard: null,
  matchedCache: null,
  loading: false,
  error: null,

  fetchCards: async (boxName) => {
    set({ loading: true, error: null })
    try {
      const cards = await cardsApi.getCards(boxName)
      set({ cards, loading: false })
    } catch (e) {
      set({ error: 'Failed to load cards', loading: false })
    }
  },

  fetchCard: async (cardId) => {
    set({ loading: true, error: null })
    try {
      const card = await cardsApi.getCard(cardId)
      set({ currentCard: card, loading: false })

      // Auto-load matched cache
      const matchedId = card.matched_scryfall_id
        || (card.scryfall_suggestions[0]?.scryfall_id ?? null)
      if (matchedId) {
        try {
          const cache = await scryfallApi.getScryfallCard(matchedId)
          set({ matchedCache: cache })
        } catch {
          set({ matchedCache: null })
        }
      } else {
        set({ matchedCache: null })
      }
    } catch (e) {
      set({ error: 'Failed to load card', loading: false })
    }
  },

  updateCard: async (cardId, fields) => {
    await cardsApi.updateCard(cardId, fields)
    await get().fetchCard(cardId)
  },

  moveCards: async (cardIds, targetBoxId) => {
    await cardsApi.moveCards(cardIds, targetBoxId)
  },

  setMatchFromScryfall: async (cardId, identifier) => {
    // Fetch from Scryfall public API
    const cardData = await scryfallApi.fetchFromScryfall(identifier)
    const scryfallId = cardData.id as string
    const name = cardData.name as string

    // Cache in backend
    await scryfallApi.cacheScryfallCard(cardData)

    // Check if this overrides the top suggestion
    const card = get().currentCard
    const topSuggestionId = card?.scryfall_suggestions[0]?.scryfall_id ?? null
    const overridden = topSuggestionId !== null && scryfallId !== topSuggestionId

    const fields: CardPatch = { matched_scryfall_id: scryfallId }
    if (overridden) fields.suggestion_overridden = true
    await cardsApi.updateCard(cardId, fields)

    // Reload card
    await get().fetchCard(cardId)
    return { name }
  },

  loadMatchedCache: async (scryfallId) => {
    try {
      const cache = await scryfallApi.getScryfallCard(scryfallId)
      set({ matchedCache: cache })
    } catch {
      set({ matchedCache: null })
    }
  },

  clearCurrentCard: () => set({ currentCard: null, matchedCache: null }),
}))
