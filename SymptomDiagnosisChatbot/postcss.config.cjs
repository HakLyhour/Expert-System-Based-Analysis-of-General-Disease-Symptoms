// postcss.config.cjs
module.exports = {
  plugins: {
    //'@tailwindcss/postcss': {}, // 👈 Correct plugin for Tailwind CSS v4+
    tailwindcss: {}, // 👈 Tailwind CSS plugin
    autoprefixer: {},
  },
}
