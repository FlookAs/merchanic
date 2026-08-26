interface ImageDisplayProps {
  imageKey: string | null
  alt: string
  className?: string
}

export default function ImageDisplay({ imageKey, alt, className = '' }: ImageDisplayProps) {
  const r2Base = import.meta.env.VITE_R2_BASE_URL ?? ''

  if (!imageKey || !r2Base) {
    return (
      <div
        className={`bg-steel flex items-center justify-center text-muted-foreground text-sm ${className}`}
      >
        ไม่มีรูปภาพ
      </div>
    )
  }

  return (
    <img
      src={`${r2Base}/${imageKey}`}
      alt={alt}
      className={`object-cover ${className}`}
    />
  )
}
