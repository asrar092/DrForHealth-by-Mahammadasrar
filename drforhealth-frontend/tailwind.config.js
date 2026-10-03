/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Logo-derived brand palette
        green: {
          DEFAULT: '#2ECC71',
          dark: '#1A9E5C',
        },
        blue: {
          DEFAULT: '#00B4D8',
          dark: '#0077B6',
        },
        charcoal: '#2D2D2D',
        surface: '#F8FAFC',
        border: '#E5E7EB',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #2ECC71 0%, #00B4D8 100%)',
        'brand-gradient-dark': 'linear-gradient(135deg, #1A9E5C 0%, #0077B6 100%)',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(45, 45, 45, 0.08)',
        'glass-hover': '0 12px 40px rgba(45, 45, 45, 0.14)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      backdropBlur: {
        glass: '16px',
      },
    },
  },
  plugins: [],
};
