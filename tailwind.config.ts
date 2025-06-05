module.exports = {
  theme: {
    extend: {
      colors: {
        brightBlue: 'oklch(51.01% 0.274 263.83)',
        electricViolet: 'oklch(53.18% 0.28 296.97)',
        frenchViolet: 'oklch(47.66% 0.246 305.88)',
        vividPink: 'oklch(69.02% 0.277 332.77)',
        hotRed: 'oklch(61.42% 0.238 15.34)',
        orangeRed: 'oklch(63.32% 0.24 31.68)',
        gray: {
          900: 'oklch(19.37% 0.006 300.98)',
          700: 'oklch(36.98% 0.014 302.71)',
          400: 'oklch(70.9% 0.015 304.04)',
        },
      },
      backgroundImage: {
        'gradient-vertical': 'linear-gradient(180deg, var(--tw-gradient-stops))',
        'gradient-horizontal': 'linear-gradient(90deg, var(--tw-gradient-stops))',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        interTight: ['"Inter Tight"', 'sans-serif'],
      },
      borderRadius: {
        pill: '2.75rem',
      },
    },
  },
}
