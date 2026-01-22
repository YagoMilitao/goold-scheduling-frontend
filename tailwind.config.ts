import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ["var(--font-montserrat)", "sans-serif"]
      }
    }
  },
  plugins: []
} satisfies Config;
