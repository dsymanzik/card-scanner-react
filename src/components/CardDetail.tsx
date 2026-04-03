import type { ScryfallCard } from '../types'

interface CardDetailProps {
  card: ScryfallCard
  onPhotoClick: (src: string, label: string) => void
}

export default function CardDetail({ card, onPhotoClick }: CardDetailProps) {
  return (
    <div className="flex gap-4">
      {/* Card image */}
      {card.image_url ? (
        <button
          type="button"
          onClick={() => onPhotoClick(card.image_url!, card.name)}
          className="flex-shrink-0 rounded overflow-hidden hover:opacity-80 transition-opacity"
          style={{ width: 180, height: 252 }}
        >
          <img
            src={card.image_url}
            alt={card.name}
            className="w-full h-full object-cover"
          />
        </button>
      ) : (
        <div
          className="flex-shrink-0 rounded bg-[#2a2a2a] flex items-center justify-center text-[#555] text-sm"
          style={{ width: 180, height: 252 }}
        >
          No image
        </div>
      )}

      {/* Text details */}
      <div className="flex flex-col gap-2 min-w-0">
        {/* Name + mana cost */}
        <div>
          <div className="text-[#eee] text-base font-semibold">{card.name}</div>
          {card.mana_cost && (
            <div className="text-[#aaa] text-sm font-mono">{card.mana_cost}</div>
          )}
        </div>

        {/* Type line */}
        <div className="text-[#bbb] text-sm">{card.type_line}</div>

        {/* Oracle text */}
        {card.oracle_text && (
          <div className="text-[#999] text-xs leading-relaxed whitespace-pre-line border border-[#2a2a2a] rounded p-2 bg-[#141414]">
            {card.oracle_text}
          </div>
        )}

        {/* Prices */}
        <div className="flex gap-4 text-xs">
          <div>
            <span className="text-[#666]">Normal: </span>
            <span className="text-[#ccc]">
              {card.price_normal ? `$${card.price_normal}` : '\u2014'}
            </span>
          </div>
          <div>
            <span className="text-[#666]">Foil: </span>
            <span className="text-[#ccc]">
              {card.price_foil ? `$${card.price_foil}` : '\u2014'}
            </span>
          </div>
        </div>

        {/* Set / collector / rarity / artist */}
        <div className="text-xs text-[#777] flex flex-col gap-0.5 mt-auto">
          <div>
            <span className="text-[#555]">Set: </span>
            {card.set_code.toUpperCase()} #{card.collector_number}
          </div>
          <div>
            <span className="text-[#555]">Rarity: </span>
            <span className="capitalize">{card.rarity}</span>
          </div>
          <div>
            <span className="text-[#555]">Artist: </span>
            {card.artist}
          </div>
        </div>
      </div>
    </div>
  )
}
