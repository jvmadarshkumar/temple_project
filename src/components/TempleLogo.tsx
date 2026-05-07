export default function TempleLogo({ size = 48, color = "currentColor", style = {}, className = "" }: { size?: number, color?: string, style?: React.CSSProperties, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      style={style}
      className={className}
    >
      {/* 1. Grand Stairs / Platform (Ram Mandir style) */}
      <path d="M1 22h22" />
      <path d="M3 20h18" />
      <path d="M5 18h14" />

      {/* 2. Pillars of the Mandapa */}
      <path d="M6 18v-3" />
      <path d="M9 18v-3" />
      <path d="M15 18v-3" />
      <path d="M18 18v-3" />
      
      {/* 3. First Floor Ceiling */}
      <path d="M4 15h16" />

      {/* 4. Central Main Shikhara (Garba Griha Spire) */}
      <path d="M10 15v-4l2-6 2 6v4" />
      <path d="M9 11h6" />
      <path d="M10 8h4" />
      
      {/* 5. Side Mandapas (Smaller domes) */}
      <path d="M5 15v-2l2-3 2 3v2" />
      <path d="M15 15v-2l2-3 2 3v2" />

      {/* 6. Main Dhvaja (Flag) of Bhagwan Ram */}
      <path d="M12 5V1" />
      <path d="M12 1h4l-1.5 1 1.5 1h-4" />

      {/* 7. Main Archway / Door */}
      <path d="M9.5 18v-2.5c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5V18" />

      {/* 8. Dhanush (Bow & Arrow of Lord Ram) Inside the Archway */}
      {/* Bow Curve */}
      <path d="M12.5 14.5c-1.5 0-2 1-2 2s.5 2 2 2" />
      {/* Bow String */}
      <path d="M12.5 14.5v4" />
      {/* Arrow Shaft */}
      <path d="M10.5 16.5h3.5" />
      {/* Arrow Head */}
      <path d="M13 15.5l1 1-1 1" />
    </svg>
  );
}
