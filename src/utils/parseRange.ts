/**
 * Parse a position range string like "1,3,50-60,203" into an array of numbers.
 */
export function parseRange(rangeStr: string): number[] {
  const positions: number[] = []
  for (const part of rangeStr.split(',')) {
    const trimmed = part.trim()
    if (trimmed.includes('-')) {
      const [startStr, endStr] = trimmed.split('-', 2)
      const start = parseInt(startStr, 10)
      const end = parseInt(endStr, 10)
      if (isNaN(start) || isNaN(end)) continue
      for (let i = start; i <= end; i++) positions.push(i)
    } else {
      const num = parseInt(trimmed, 10)
      if (!isNaN(num)) positions.push(num)
    }
  }
  return positions
}
