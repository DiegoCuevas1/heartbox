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
       
        main: "#FFFFFF",
        links:"#d31c60",
        posts:"#fdeff1",
        border: "#d31c60",
        default: "#000000",
        secondary:"#A0A0A0",
        date:'#808080',
        grayrgb:'#d8d8d8'
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
