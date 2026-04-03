interface PhotoStripProps {
  photoUrls: string[]
  onPhotoClick: (src: string, label: string) => void
}

export default function PhotoStrip({ photoUrls, onPhotoClick }: PhotoStripProps) {
  if (photoUrls.length === 0) {
    return (
      <div className="text-[#888] text-sm italic py-4">No photos available</div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-2" style={{ maxWidth: 272 }}>
        {photoUrls.map((url, i) => (
          <button
            key={url}
            type="button"
            onClick={() => onPhotoClick(url, i === 0 ? '★ Primary' : `Photo ${i + 1}`)}
            className={`rounded overflow-hidden border-2 aspect-[488/680] ${
              i === 0 ? 'border-[#4a7a9a]' : 'border-transparent'
            } hover:opacity-80 transition-opacity`}
          >
            <img
              src={url}
              alt={i === 0 ? 'Primary photo' : `Photo ${i + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
      <p className="text-[#666] text-xs mt-1.5">★ = primary photo</p>
    </div>
  )
}
