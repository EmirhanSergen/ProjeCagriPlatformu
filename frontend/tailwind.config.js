/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",         // HTML entry
    "./src/**/*.{js,ts,jsx,tsx}" // All source files for purging unused styles
  ],
  theme: {
    extend: {},               // Add custom theming here
  },
  plugins: [],               // Add Tailwind plugins (e.g., forms, typography)
}
