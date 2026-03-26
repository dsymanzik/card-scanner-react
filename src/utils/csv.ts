import type { Card, ExportFormat } from '../types'

interface ExportRow {
  [key: string]: string | number
}

function getEffectiveFoil(card: Card): boolean {
  return card.foil_user_override !== null ? card.foil_user_override : card.foil_detected
}

function getEffectiveScryfallId(card: Card): string {
  return card.matched_scryfall_id || card.scryfall_suggestions[0]?.scryfall_id || ''
}

function getTopSuggestion(card: Card) {
  return card.scryfall_suggestions[0] ?? null
}

function buildRow(card: Card, format: ExportFormat, boxName: string): ExportRow {
  const foil = getEffectiveFoil(card)
  const sugg = getTopSuggestion(card)
  const name = sugg?.name || ''
  const setCode = (sugg?.set_code || '').toUpperCase()
  const collectorNumber = sugg?.collector_number || ''
  const confidence = sugg?.confidence

  switch (format) {
    case 'moxfield':
      return {
        Count: 1, Name: name, Edition: setCode,
        Condition: card.condition || '', Foil: foil ? 'foil' : '',
        'Collector Number': collectorNumber, 'Scryfall ID': getEffectiveScryfallId(card),
      }
    case 'deckbox':
      return {
        Count: 1, Name: name, Edition: setCode,
        'Card Number': collectorNumber, Condition: card.condition || '',
        Foil: foil ? 'Yes' : 'No',
      }
    case 'tcgplayer':
      return {
        Quantity: 1, Name: name, Set: setCode,
        'Card Number': collectorNumber, Condition: card.condition || '',
        Printing: foil ? 'Foil' : 'Normal',
      }
    default:
      return {
        'Scryfall ID': getEffectiveScryfallId(card), 'Card Name': name,
        'Set Code': setCode, 'Collector Number': collectorNumber,
        Foil: foil ? 'Yes' : 'No', Condition: card.condition || '',
        'Box Name': boxName, 'Position in Box': card.position,
        Reviewed: card.reviewed ? 'Yes' : 'No',
        'Confidence Score': confidence !== undefined ? confidence.toFixed(2) : '',
        'Photo Paths': card.photo_urls.join('|'),
        'Scanned Date': card.scanned_at || '',
      }
  }
}

function escapeCSV(value: string | number): string {
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function generateCSV(
  cards: Card[],
  format: ExportFormat,
  boxNameMap: Record<number, string>,
): string {
  if (cards.length === 0) return ''

  const rows = cards.map(card => buildRow(card, format, boxNameMap[card.box_id] || ''))
  const headers = Object.keys(rows[0])
  const lines = [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => headers.map(h => escapeCSV(row[h] ?? '')).join(',')),
  ]
  return lines.join('\n')
}

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
