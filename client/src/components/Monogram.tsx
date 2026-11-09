interface Props {
  size?: number;
  className?: string;
  /** Mostra a folha de antúrio acima das letras */
  leaf?: boolean;
}

export function Monogram({ size = 64, className = '', leaf = true }: Props) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className={className} aria-label="Monograma A e F">
      {leaf && (
        <g transform="translate(100 62) scale(0.55)">
          <path
            d="M0 -70 C 52 -62, 78 -18, 58 30 C 44 64, 14 78, 0 84 C -14 78, -44 64, -58 30 C -78 -18, -52 -62, 0 -70 Z"
            fill="#a4a87c"
            opacity="0.85"
          />
          <path d="M0 -58 L0 80" stroke="#747948" strokeWidth="4" strokeLinecap="round" />
          <path
            d="M0 -20 C 18 -8, 30 8, 36 26 M0 10 C -18 20, -28 32, -34 46"
            stroke="#747948"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
          />
        </g>
      )}
      <g fontFamily="'Cormorant Garamond', Georgia, serif" fontWeight="500" fill="#36441d" textAnchor="middle">
        <text x="72" y={leaf ? 170 : 140} fontSize="78">
          A
        </text>
        <text x="100" y={leaf ? 166 : 136} fontSize="58" fill="#747948" opacity="0.75">
          |
        </text>
        <text x="130" y={leaf ? 170 : 140} fontSize="78">
          F
        </text>
      </g>
    </svg>
  );
}
