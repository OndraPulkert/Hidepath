/** Schéma: čepel 45° ve směru řezu, 90° k podložce. Čárová kresba ve stylu prototypu. */
export function BladeAngleIllustration({ title }: { title: string }) {
  return (
    <svg viewBox="0 0 320 180" role="img" aria-label={title} className="h-auto w-full">
      <rect x="0" y="0" width="320" height="180" fill="#FBF8F2" />
      {/* podložka a kůže – pohled z boku */}
      <rect x="20" y="140" width="280" height="14" rx="2" fill="#E7DCCB" />
      <rect x="40" y="128" width="240" height="12" rx="2" fill="#A85F32" opacity=".85" />
      <text x="24" y="172" fontFamily="ui-monospace, Menlo, monospace" fontSize="10" fill="#6B5F57">
        podložka
      </text>
      <text
        x="200"
        y="124"
        fontFamily="ui-monospace, Menlo, monospace"
        fontSize="10"
        fill="#6B5F57"
      >
        kůže 1,2–1,5 mm
      </text>
      {/* čepel pod 45° */}
      <g stroke="#2B211C" strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M150 128 L110 88 L104 82" />
        <path d="M150 128 L156 122 L118 84" />
        <path d="M104 82 L118 84" />
        <path d="M110 88 L70 48 L90 40 L122 72" fill="#FBF8F2" />
      </g>
      {/* úhel 45° */}
      <path d="M150 128 L200 128" stroke="#2B211C" strokeWidth="1" strokeDasharray="3 3" />
      <path d="M180 128 A30 30 0 0 0 171 107" stroke="#7E4423" strokeWidth="1.5" fill="none" />
      <text
        x="186"
        y="112"
        fontFamily="ui-monospace, Menlo, monospace"
        fontSize="11"
        fill="#7E4423"
      >
        45°
      </text>
      {/* směr řezu */}
      <path
        d="M230 100 L268 100"
        stroke="#33483B"
        strokeWidth="2"
        strokeLinecap="round"
        markerEnd="url(#arrow)"
      />
      <text
        x="226"
        y="94"
        fontFamily="Albert Sans, system-ui, sans-serif"
        fontSize="11"
        fill="#33483B"
      >
        směr tahu
      </text>
      <defs>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10 z" fill="#33483B" />
        </marker>
      </defs>
      {/* kolmost – pohled zepředu (malý inset) */}
      <g transform="translate(24 20)">
        <rect
          x="0"
          y="0"
          width="70"
          height="52"
          rx="6"
          fill="none"
          stroke="rgba(43,33,28,.34)"
          strokeDasharray="3 3"
        />
        <rect x="8" y="38" width="54" height="6" fill="#A85F32" opacity=".85" />
        <path d="M35 8 L35 38" stroke="#2B211C" strokeWidth="2" />
        <path d="M31 8 L39 8" stroke="#2B211C" strokeWidth="2" />
        <text x="41" y="34" fontFamily="ui-monospace, Menlo, monospace" fontSize="9" fill="#7E4423">
          90°
        </text>
        <text
          x="0"
          y="62"
          fontFamily="Albert Sans, system-ui, sans-serif"
          fontSize="9"
          fill="#6B5F57"
        >
          zepředu: kolmo
        </text>
      </g>
    </svg>
  );
}
