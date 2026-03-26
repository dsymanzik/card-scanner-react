import api from './client'
import type { HealthStatus, PipelineState } from '../types'

export async function getHealth(): Promise<HealthStatus> {
  const { data } = await api.get<HealthStatus>('/health')
  return data
}

export async function getPipelineState(): Promise<PipelineState> {
  const { data } = await api.get<PipelineState>('/pipeline/status')
  return data
}

export async function getPipelineLogs(): Promise<string[]> {
  const { data } = await api.get<string[]>('/pipeline/logs')
  return data
}
