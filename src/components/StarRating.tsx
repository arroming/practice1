import { useState } from 'react'

interface StarRatingProps {
  value: number       // 0 = none, 1–5
  onChange?: (v: number) => void
  readonly?: boolean
  size?: 'sm' | 'md'
}

export default function StarRating({ value, onChange, readonly = false, size = 'md' }: StarRatingProps) {
  const [hover, setHover] = useState(0)
  const active = hover || value
  const sz = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5'

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(i === value ? 0 : i)}
          onMouseEnter={() => !readonly && setHover(i)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`transition-transform duration-75 ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
          aria-label={`중요도 ${i}`}
        >
          <svg
            className={`${sz} transition-colors duration-100 ${
              active >= i ? 'text-red-500' : 'text-red-200'
            }`}
            viewBox="0 0 24 24"
            fill={active >= i ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
        </button>
      ))}
    </div>
  )
}
