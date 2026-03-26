import api from './client'
import type { Box } from '../types'

export async function getBoxes(): Promise<Box[]> {
  const { data } = await api.get<Box[]>('/boxes')
  return data
}

export async function createBox(name: string): Promise<Box> {
  const { data } = await api.post<Box>('/boxes', { name })
  return data
}

export async function renameBox(boxId: number, name: string): Promise<Box> {
  const { data } = await api.patch<Box>(`/boxes/${boxId}`, { name })
  return data
}

export async function deleteBox(boxId: number): Promise<void> {
  await api.delete(`/boxes/${boxId}`)
}

export async function mergeBox(targetBoxId: number, sourceBoxId: number): Promise<void> {
  await api.post(`/boxes/${targetBoxId}/merge`, { source_box_id: sourceBoxId })
}
