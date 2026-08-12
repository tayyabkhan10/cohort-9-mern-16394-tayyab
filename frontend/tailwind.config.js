export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas)",
        "canvas-line": "var(--canvas-line)",
        paper: "var(--paper)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        "body-muted": "var(--text-muted)",
        accent: "var(--accent)",
        danger: "var(--danger)",
        "danger-soft": "var(--danger-soft)",
      },
      boxShadow: {
        lift: "0 12px 30px -12px rgba(33, 32, 28, 0.25)",
      },
    },
  },
  plugins: [],
};
