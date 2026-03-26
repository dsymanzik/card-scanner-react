import { create } from 'zustand'
import type { HealthStatus, PipelineState } from '../types'
import * as monitoringApi from '../api/monitoring'

interface MonitoringState {
  health: HealthStatus | null
  healthOnline: boolean
  pipeline: PipelineState | null
  pipelineAvailable: boolean
  loading: boolean
  fetchStatus: () => Promise<void>
}

export const useMonitoringStore = create<MonitoringState>((set) => ({
  health: null,
  healthOnline: false,
  pipeline: null,
  pipelineAvailable: false,
  loading: false,

  fetchStatus: async () => {
    set({ loading: true })

    // Fetch health (Windows API)
    try {
      const health = await monitoringApi.getHealth()
      set({ health, healthOnline: true })
    } catch {
      set({ health: null, healthOnline: false })
    }

    // Fetch pipeline state (Windows API — endpoints TBD)
    try {
      const pipeline = await monitoringApi.getPipelineState()
      const logs = await monitoringApi.getPipelineLogs()
      set({ pipeline: { ...pipeline, log_lines: logs }, pipelineAvailable: true })
    } catch {
      set({ pipeline: null, pipelineAvailable: false })
    }

    set({ loading: false })
  },
}))
