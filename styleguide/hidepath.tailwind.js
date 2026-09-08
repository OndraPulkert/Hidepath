/** Hidepath — Tailwind v3 theme (tailwind.config.js → theme.extend) */
module.exports = {
  theme: {
    extend: {
      colors: {
        canvas: '#F4EFE6',
        parchment: '#E7DCCB',
        paper: '#FBF8F2',
        cognac: { DEFAULT: '#A85F32', deep: '#7E4423', hover: '#8F5029', tint: '#F1E1D3' },
        leather: '#2B211C',
        forest: { DEFAULT: '#33483B', hover: '#26382D', tint: '#E1E7E0' },
        brass: { DEFAULT: '#B08A57', tint: '#F3EBDD' },
        success: '#5E7A5B',
        ink: { DEFAULT: '#2B211C', 2: '#6B5F57' },
        line: { DEFAULT: 'rgba(43,33,28,.14)', strong: 'rgba(43,33,28,.34)' },
      },
      fontFamily: {
        serif: ['Spectral', 'Georgia', 'serif'],
        sans: ['"Albert Sans"', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'Menlo', 'SF Mono', 'monospace'],
      },
      fontSize: {
        kicker: ['12px', { lineHeight: '1.3', letterSpacing: '.08em' }],
        meta: ['13px', { lineHeight: '1.45' }],
        body: ['15px', { lineHeight: '1.55' }],
        'body-lg': ['16px', { lineHeight: '1.6' }],
        step: ['17px', { lineHeight: '1.35', fontWeight: '600' }],
        row: ['19px', { lineHeight: '1.3', fontWeight: '600' }],
        h2: ['22px', { lineHeight: '1.15' }],
        stat: ['30px', { lineHeight: '1.1' }],
        h1: ['40px', { lineHeight: '1.1' }],
        'h1-lg': ['48px', { lineHeight: '1.1' }],
      },
      borderRadius: {
        control: '8px',
        DEFAULT: '10px',
        card: '16px',
      },
      spacing: {
        touch: '44px',
        bar: '52px',
        thumb: '84px',
      },
      maxWidth: { app: '1200px', prose: '64ch' },
      borderWidth: { 1.5: '1.5px' },
      boxShadow: { none: 'none' },
      keyframes: { 'hp-in': { from: { opacity: 0, transform: 'translateY(6px)' }, to: { opacity: 1, transform: 'none' } } },
      animation: { 'hp-in': 'hp-in .35s ease' },
    },
  },
};
