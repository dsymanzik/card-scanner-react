import api from './client'
import type { ScannedCard, CardPatch } from '../types'

export async function getCards(box?: string): Promise<ScannedCard[]> {
  const params: Record<string, string> = {}
  if (box) params.box = box
  const { data } = await api.get<ScannedCard[]>('/cards', { params })
  return data
}

export async function getCard(cardId: number): Promise<ScannedCard> {
  const { data } = await api.get<ScannedCard>(`/cards/${cardId}`)
  return data
}

export async function updateCard(cardId: number, fields: CardPatch): Promise<ScannedCard> {
  const { data } = await api.patch<ScannedCard>(`/cards/${cardId}`, fields)
  return data
}

export async function moveCards(cardIds: number[], targetBoxId: number): Promise<void> {
  await api.post('/cards/move', { card_ids: cardIds, target_box_id: targetBoxId })
}

export async function deleteCard(cardId: number): Promise<void> {
  await api.delete(`/cards/${cardId}`)
}
