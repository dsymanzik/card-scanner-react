import api from './client'
import axios from 'axios'
import type { ScryfallCard } from '../types'

// Backend cache
export async function getScryfallCard(scryfallId: string): Promise<ScryfallCard> {
  const { data } = await api.get<ScryfallCard>(`/scryfall/cache/${scryfallId}`)
  return data
}

export async function cacheScryfallCard(cardData: Record<string, unknown>): Promise<void> {
  await api.post('/scryfall/cache', cardData)
}

// Direct Scryfall public API
export async function fetchFromScryfall(identifier: string): Promise<Record<string, unknown>> {
  if (identifier.includes('scryfall.com')) {
    const parts = identifier.replace(/\/+$/, '').split('/')
    const cardIdx = parts.indexOf('card')
    if (cardIdx === -1 || cardIdx + 2 >= parts.length) {
      throw new Error('Could not parse Scryfall URL — paste a direct card URL or UUID.')
    }
    const setCode = parts[cardIdx + 1]
    const collectorNum = parts[cardIdx + 2]
    const { data } = await axios.get(
      `https://api.scryfall.com/cards/${setCode}/${collectorNum}`,
      { timeout: 5000 }
    )
    return data
  } else {
    const { data } = await axios.get(
      `https://api.scryfall.com/cards/${identifier}`,
      { timeout: 5000 }
    )
    return data
  }
}
