/** Schéma: hrana kůže, linie stehu 3,5 mm, otvory v rozteči 3,85–4 mm. */
export function StitchOffsetIllustration({ title }: { title: string }) {
  const holes = Array.from({ length: 9 }, (_, i) => 60 + i * 26);
  return (
    <svg viewBox="0 0 320 160" role="img" aria-label={title} className="h-auto w-full">
      <rect width="320" height="160" fill="#FBF8F2" />
      {/* kůže shora */}
      <rect
        x="30"
        y="40"
        width="260"
        height="90"
        rx="8"
        fill="#F1E1D3"
        stroke="#2B211C"
        strokeWidth="1.5"
      />
      {/* linie stehu */}
      <path d="M40 64 L280 64" stroke="#7E4423" strokeWidth="1" strokeDasharray="4 3" />
      {holes.map((x) => (
        <path
          key={x}
          d={`M${x - 3} 67 L${x + 3} 61`}
          stroke="#2B211C"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      ))}
      {/* kóta 3,5 mm od hrany */}
      <g stroke="#33483B" strokeWidth="1">
        <path d="M300 40 L300 64" />
        <path d="M296 40 L304 40" />
        <path d="M296 64 L304 64" />
      </g>
      <text x="262" y="30" fontFamily="ui-monospace, Menlo, monospace" fontSize="11" fill="#33483B">
        3,5 mm od hrany
      </text>
      {/* kóta rozteče */}
      <g stroke="#33483B" strokeWidth="1">
        <path d="M112 84 L138 84" />
        <path d="M112 80 L112 88" />
        <path d="M138 80 L138 88" />
      </g>
      <text x="96" y="102" fontFamily="ui-monospace, Menlo, monospace" fontSize="11" fill="#33483B">
        rozteč 3,85–4 mm
      </text>
      <text
        x="40"
        y="150"
        fontFamily="Albert Sans, system-ui, sans-serif"
        fontSize="11"
        fill="#6B5F57"
      >
        otvory jsou šikmé – všechny stejným směrem
      </text>
    </svg>
  );
}
