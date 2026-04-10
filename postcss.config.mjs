// Tailwind v4 uses a single PostCSS plugin. No autoprefixer needed
// (Tailwind v4 ships its own vendor prefix handling).

export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
