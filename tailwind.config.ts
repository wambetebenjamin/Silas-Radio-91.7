import type { Config } from 'tailwindcss';

/**
 * Tailwind is used for utilities only.
 * The design system itself lives in src/app/globals.css as CSS custom
 * properties extracted from the design source (Colorlib "DJoz").
 * Colours here mirror those tokens so utility classes stay on-brand.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}', './content/**/*.mdx'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#5c00ce', // $primary-color
          hover: '#7e00ad',
          pressed: '#5400bc',
          glass: 'rgba(42, 1, 74, 0.5)',
          solid: '#290849',
        },
        ink: {
          heading: '#111111',
          para: '#444444',
          muted: '#888888',
          muted2: '#666666',
        },
        surface: {
          bg: '#f5f5f5',
          bg2: '#f2f2f2',
          border: '#ebebeb',
          border1: '#e1e1e1',
        },
        marker: {
          red: '#f44336',
          purple: '#673ab7',
        },
        whatsapp: '#25d366',
      },
      fontFamily: {
        body: ['Now Regular', 'var(--font-body)', 'system-ui', 'sans-serif'],
        medium: ['Now Medium', 'Now Regular', 'system-ui', 'sans-serif'],
        bold: ['Now Bold', 'Now Regular', 'system-ui', 'sans-serif'],
        heading: ['Rajdhani', 'Now Regular', 'sans-serif'],
        display: ['Rockville Solid Regular', 'Rajdhani', 'sans-serif'],
      },
      fontSize: {
        base: ['15px', { lineHeight: '26px' }],
        nav: ['13px', { lineHeight: '1.4' }],
        btn: ['12px', { lineHeight: '1.4' }],
        meta: ['11px', { lineHeight: '1.5' }],
        h6: ['16px', { lineHeight: '1.3' }],
        h5: ['18px', { lineHeight: '1.3' }],
        h4: ['24px', { lineHeight: '1.25' }],
        h3: ['30px', { lineHeight: '1.2' }],
        h2: ['36px', { lineHeight: '1.15' }],
        h1: ['70px', { lineHeight: '1.05' }],
      },
      letterSpacing: {
        eyebrow: '6px',
        button: '2px',
        nav: '0.5px',
      },
      spacing: {
        spad: '100px',
        nav: '76px',
        player: '96px',
        'player-compact': '72px',
      },
      zIndex: {
        nav: '7000',
        whatsapp: '7700',
        player: '8000',
        cookie: '9000',
        modal: '9500',
        preloader: '999999',
      },
      screens: {
        xs: '320px',
        sm: '390px',
        md: '768px',
        lg: '1024px',
        xl: '1440px',
      },
      transitionTimingFunction: {
        'out-brand': 'cubic-bezier(0.22, 0.61, 0.36, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
