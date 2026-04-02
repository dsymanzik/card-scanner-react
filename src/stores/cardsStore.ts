import { create } from 'zustand'
import type { Card, CardPatch } from '../types'
import * as cardsApi from '../api/cards'

interface CardsState {
  cards: Card[]
  loading: boolean
  error: string | null
  fetchCards: (boxName?: string) => Promise<void>
  updateCard: (cardId: number, fields: CardPatch) => Promise<void>
  moveCards: (cardIds: number[], targetBoxId: number) => Promise<void>
}

export const useCardsStore = create<CardsState>((set) => ({
  cards: [],
  loading: false,
  error: null,

  fetchCards: async (boxName) => {
    set({ loading: true, error: null })
    try {
      const cards = await cardsApi.getCards(boxName)
      set({ cards, loading: false })
    } catch {
      set({ error: 'Failed to load cards', loading: false })
    }
  },

  updateCard: async (cardId, fields) => {
    await cardsApi.updateCard(cardId, fields)
    set((state) => ({
      cards: state.cards.map((c) => (c.id === cardId ? { ...c, ...fields } : c)),
    }))
  },

  moveCards: async (cardIds, targetBoxId) => {
    await cardsApi.moveCards(cardIds, targetBoxId)
  },
}))
