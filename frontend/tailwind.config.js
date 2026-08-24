/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      "colors": {
        "error": "#ba1a1a",
        "inverse-primary": "#b4c5ff",
        "outline": "#737686",
        "secondary": "#006c49",
        "on-surface-variant": "#434655",
        "surface-tint": "#0053db",
        "surface-variant": "#d3e4fe",
        "on-tertiary": "#ffffff",
        "urgency-medium": "#F59E0B",
        "clinical-blue-dark": "#1E40AF",
        "primary-fixed-dim": "#b4c5ff",
        "primary-container": "#2563eb",
        "on-secondary-fixed": "#002113",
        "on-error-container": "#93000a",
        "surface-container-highest": "#d3e4fe",
        "background": "#f8f9ff",
        "surface-background": "#F8FAFC",
        "on-tertiary-fixed-variant": "#653e00",
        "surface": "#f8f9ff",
        "tertiary-fixed": "#ffddb8",
        "outline-variant": "#c3c6d7",
        "secondary-container": "#6cf8bb",
        "secondary-fixed-dim": "#4edea3",
        "on-tertiary-fixed": "#2a1700",
        "inverse-on-surface": "#eaf1ff",
        "primary-fixed": "#dbe1ff",
        "on-surface": "#0b1c30",
        "urgency-high": "#EF4444",
        "inverse-surface": "#213145",
        "on-primary": "#ffffff",
        "on-primary-container": "#eeefff",
        "on-secondary-fixed-variant": "#005236",
        "error-container": "#ffdad6",
        "on-secondary": "#ffffff",
        "surface-container": "#e5eeff",
        "on-secondary-container": "#00714d",
        "on-error": "#ffffff",
        "secondary-fixed": "#6ffbbe",
        "surface-container-high": "#dce9ff",
        "tertiary-fixed-dim": "#ffb95f",
        "surface-container-lowest": "#ffffff",
        "primary": "#004ac6",
        "on-primary-fixed": "#00174b",
        "tertiary-container": "#996100",
        "on-primary-fixed-variant": "#003ea8",
        "on-tertiary-container": "#ffeedd",
        "surface-container-low": "#eff4ff",
        "tertiary": "#784b00",
        "soothing-green-light": "#ECFDF5",
        "surface-bright": "#f8f9ff",
        "urgency-low": "#10B981",
        "on-background": "#0b1c30",
        "surface-dim": "#cbdbf5"
      },
      "borderRadius": {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      "spacing": {
        "gutter-md": "24px",
        "unit": "4px",
        "margin-container": "32px",
        "section-gap": "64px"
      },
      "fontFamily": {
        "headline-lg": ["Plus Jakarta Sans", "sans-serif"],
        "display-lg": ["Plus Jakarta Sans", "sans-serif"],
        "label-md": ["Inter", "sans-serif"],
        "headline-md": ["Plus Jakarta Sans", "sans-serif"],
        "headline-lg-mobile": ["Plus Jakarta Sans", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "caption": ["Inter", "sans-serif"]
      },
      "fontSize": {
        "headline-lg": ["32px", { "lineHeight": "40px", "fontWeight": "700" }],
        "display-lg": ["48px", { "lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "label-md": ["14px", { "lineHeight": "20px", "letterSpacing": "0.01em", "fontWeight": "600" }],
        "headline-md": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
        "headline-lg-mobile": ["24px", { "lineHeight": "32px", "fontWeight": "700" }],
        "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
        "caption": ["12px", { "lineHeight": "16px", "fontWeight": "400" }]
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}

