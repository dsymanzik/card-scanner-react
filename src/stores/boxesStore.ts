import { create } from 'zustand'
import type { Box } from '../types'
import * as boxesApi from '../api/boxes'

interface BoxesState {
  boxes: Box[]
  loading: boolean
  error: string | null
  fetchBoxes: () => Promise<void>
  createBox: (name: string) => Promise<void>
  renameBox: (boxId: number, name: string) => Promise<void>
  deleteBox: (boxId: number) => Promise<void>
  mergeBox: (targetBoxId: number, sourceBoxId: number) => Promise<void>
}

export const useBoxesStore = create<BoxesState>((set, get) => ({
  boxes: [],
  loading: false,
  error: null,

  fetchBoxes: async () => {
    set({ loading: true, error: null })
    try {
      const boxes = await boxesApi.getBoxes()
      set({ boxes, loading: false })
    } catch (e) {
      set({ error: 'Failed to load boxes', loading: false })
    }
  },

  createBox: async (name) => {
    await boxesApi.createBox(name)
    await get().fetchBoxes()
  },

  renameBox: async (boxId, name) => {
    await boxesApi.renameBox(boxId, name)
    await get().fetchBoxes()
  },

  deleteBox: async (boxId) => {
    await boxesApi.deleteBox(boxId)
    await get().fetchBoxes()
  },

  mergeBox: async (targetBoxId, sourceBoxId) => {
    await boxesApi.mergeBox(targetBoxId, sourceBoxId)
    await get().fetchBoxes()
  },
}))
