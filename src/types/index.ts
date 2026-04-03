// Box from GET /boxes
export interface Box {
  id: number
  name: string
  created_at: string
  total: number
  unreviewed: number
}

// Scryfall card data — used for matched_card, suggestions, search results
export interface ScryfallCard {
  scryfall_id: string
  name: string
  set_code: string
  collector_number: string
  mana_cost: string | null
  type_line: string
  oracle_text: string | null
  rarity: string
  artist: string | null
  image_url: string | null
  price_normal: string | null
  price_foil: string | null
  confidence: number | null
  rank: number | null
}

// Unified scanned card record from GET /cards and GET /review
export interface Card {
  id: number
  box_id: number
  position: number
  photo_urls: string[]
  foil_detected: boolean
  foil_user_override: boolean | null
  condition: string | null
  reviewed: boolean
  identified: string | null
  identification_notes: string | null
  suggestion_overridden: boolean
  override_analyzed: boolean
  scanned_at: string
  matched_card: ScryfallCard | null
  suggestions: ScryfallCard[]
}

// Review endpoint response
export interface ReviewResponse {
  box: {
    id: number
    name: string
    total: number
    unreviewed: number
  }
  nav: {
    pos: number
    total: number
    prev_pos: number | null
    next_pos: number | null
    next_unreviewed_pos: number | null
  }
  card: Card | null
}

// Health check response from GET /health
export interface HealthStatus {
  status: string
  card_count: number
  unreviewed_count: number
  disk_used_gb: number
}

// Pipeline state (from Windows API — endpoints TBD)
export interface PipelineState {
  state: 'running' | 'idle'
  inbox_count: number
  session?: {
    box: string
    submitted: number
    total: number
  }
  log_lines: string[]
}

// Card update payload for PATCH /cards/:id
export interface CardPatch {
  matched_scryfall_id?: string
  reviewed?: boolean
  foil_user_override?: boolean | null
  condition?: string | null
  suggestion_overridden?: boolean
  position?: number
}

// CSV export format options
export type ExportFormat = 'moxfield' | 'deckbox' | 'tcgplayer' | 'generic'

export const CONDITIONS = [
  'Near Mint',
  'Lightly Played',
  'Moderately Played',
  'Heavily Played',
  'Damaged',
] as const
