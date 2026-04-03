import api from './client'
import type { ReviewResponse, ScryfallCard } from '../types'

export async function getReview(boxId: number, pos: number): Promise<ReviewResponse> {
  const { data } = await api.get<ReviewResponse>('/review', {
    params: { box_id: boxId, pos },
  })
  return data
}

export async function updateReviewCard(
  cardId: number,
  fields: { reviewed?: boolean; foil_user_override?: boolean | null; condition?: string | null }
): Promise<ReviewResponse> {
  const { data } = await api.patch<ReviewResponse>(`/review/card/${cardId}`, fields)
  return data
}

export async function selectMatch(cardId: number, scryfallId: string): Promise<ReviewResponse> {
  const { data } = await api.post<ReviewResponse>(`/review/card/${cardId}/select`, {
    scryfall_id: scryfallId,
  })
  return data
}

export async function searchReview(
  name: string,
  set?: string,
  collectorNumber?: string
): Promise<ScryfallCard[]> {
  const params: Record<string, string> = { name }
  if (set) params.set = set
  if (collectorNumber) params.collector_number = collectorNumber
  const { data } = await api.get<{ results: ScryfallCard[] }>('/review/search', { params })
  return data.results
}
