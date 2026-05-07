export default function TempleLogo({ size = 48, color = "currentColor", style = {}, className = "" }: { size?: number, color?: string, style?: React.CSSProperties, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      style={style}
      className={className}
    >
      {/* Base & Stairs */}
      <path d="M2 22h20" />
      <path d="M4 22v-2h16v2" />
      <path d="M6 20v-2h12v2" />
      
      {/* Pillars */}
      <path d="M8 18V9" />
      <path d="M16 18V9" />
      
      {/* Roof / Shikhara */}
      <path d="M5 9l7-6 7 6H5z" />
      <path d="M8 7l4-3 4 3" />
      
      {/* Flag / Dhvaja */}
      <path d="M12 3V1" />
      <path d="M12 1h3l-1 1 1 1h-3" />
      
      {/* Arch / Door */}
      <path d="M10 18v-3a2 2 0 0 1 4 0v3" />
    </svg>
  );
}
