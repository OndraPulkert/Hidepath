/** Schéma sedlářského stehu: řez kůží z boku, dvě jehly proti sobě, pořadí průchodu. */
export function SaddleStitchIllustration({ title }: { title: string }) {
  return (
    <svg viewBox="0 0 320 200" role="img" aria-label={title} className="h-auto w-full">
      <rect width="320" height="200" fill="#FBF8F2" />
      {/* dvě vrstvy kůže z boku */}
      <rect x="20" y="88" width="280" height="12" fill="#A85F32" opacity=".85" />
      <rect x="20" y="100" width="280" height="12" fill="#A85F32" opacity=".65" />
      {/* otvory */}
      {[70, 120, 170, 220, 270].map((x) => (
        <rect key={x} x={x - 2} y="86" width="4" height="28" fill="#FBF8F2" />
      ))}
      {/* nit – přední (plná) a zadní (čárkovaná) */}
      <path
        d="M70 84 L120 116 L170 84 L220 116 L270 84"
        stroke="#2B211C"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M70 116 L120 84 L170 116 L220 84 L270 116"
        stroke="#2B211C"
        strokeWidth="2"
        fill="none"
        strokeDasharray="5 4"
        strokeLinecap="round"
      />
      {/* jehly */}
      <g stroke="#2B211C" strokeWidth="2.5" strokeLinecap="round">
        <path d="M40 60 L66 82" />
        <path d="M300 140 L274 118" />
      </g>
      <circle cx="40" cy="60" r="3" fill="none" stroke="#2B211C" strokeWidth="1.5" />
      <circle cx="300" cy="140" r="3" fill="none" stroke="#2B211C" strokeWidth="1.5" />
      <text
        x="24"
        y="48"
        fontFamily="Albert Sans, system-ui, sans-serif"
        fontSize="11"
        fill="#2B211C"
        fontWeight="600"
      >
        1. přední jehla
      </text>
      <text
        x="212"
        y="166"
        fontFamily="Albert Sans, system-ui, sans-serif"
        fontSize="11"
        fill="#2B211C"
        fontWeight="600"
      >
        2. zadní jehla
      </text>
      <text
        x="24"
        y="188"
        fontFamily="Albert Sans, system-ui, sans-serif"
        fontSize="11"
        fill="#6B5F57"
      >
        vždy stejné pořadí · zadní jehla nad přední nití · utáhnout obě stejně
      </text>
      <text x="20" y="30" fontFamily="ui-monospace, Menlo, monospace" fontSize="10" fill="#6B5F57">
        líc
      </text>
      <text x="20" y="134" fontFamily="ui-monospace, Menlo, monospace" fontSize="10" fill="#6B5F57">
        rub
      </text>
    </svg>
  );
}
