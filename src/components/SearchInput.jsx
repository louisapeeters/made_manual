export default function SearchInput({ placeholder, value, onChange, className = '', variant = 'default' }) {
  const isLarge = variant === 'large'
  const isMedium = variant === 'medium'
  const isStyled = isLarge || isMedium

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={
          isStyled
            ? 'search-input-large w-full font-body text-base border bg-white text-made-neutral-100 outline-none transition-colors duration-200 focus:border-made-neutral-60'
            : 'w-full py-2.5 pl-4 pr-10 font-body text-[14px] border border-made-neutral-15 rounded-lg bg-white text-made-neutral-100 outline-none transition-colors duration-200 focus:border-made-neutral-60 placeholder:text-[#B6C6C6]'
        }
        style={
          isLarge
            ? {
                borderColor: '#B6C6C6',
                borderRadius: 8,
                padding: '17px 60px 17px 24px',
                color: '#0F1010',
                fontSize: 19,
              }
            : isMedium
            ? {
                borderColor: '#B6C6C6',
                borderRadius: 8,
                padding: '8px 40px 8px 16px',
                color: '#0F1010',
              }
            : undefined
        }
      />
      <svg
        className={
          isLarge
            ? 'absolute right-5 top-1/2 -translate-y-1/2 w-[24px] h-[24px] pointer-events-none'
            : isMedium
            ? 'absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none'
            : 'absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none'
        }
        style={{ color: isStyled ? '#6324F3' : '#B6C6C6' }}
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="7" cy="7" r="5.25" />
        <path d="M11 11l3.5 3.5" strokeLinecap="round" />
      </svg>
    </div>
  )
}
