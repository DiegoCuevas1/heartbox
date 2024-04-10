import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // **** OUTDATED COLORS - PHASE THESE OUT ****
        main: "#FDE9F1",
        // text: "#1B1C57",
        border: "#D31C60",
        default: "#000000",
      },
      backgroundColor: {
        'pink-background': 'var(--color-pink-background)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontFamily: {
        'loves': ['LOVES', 'sans-serif'],
        'default': ['Wendelin-Krftig', 'sans-serif'],
      },
      
        
      
    },
  },
  plugins: [],
}
export default config
