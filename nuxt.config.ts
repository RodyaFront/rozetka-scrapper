import Aura from "@primevue/themes/aura";

export default defineNuxtConfig({
  ssr: false,

  compatibilityDate: "2024-04-03",

  modules: ["@primevue/nuxt-module"],

  css: ["~/assets/scss/index.scss", "~/assets/css/main.css"],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  sourcemap: {
    server: true,
    client: true,
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/assets/scss/_params.scss";`,
        },
      },
    },
  },

  primevue: {
    options: {
      theme: {
        preset: Aura,
      },
    },
  },

  devtools: { enabled: true },
});
