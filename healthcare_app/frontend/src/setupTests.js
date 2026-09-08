// Adds the jest-dom matchers, for example toBeInTheDocument, to Vitest expect.
import '@testing-library/jest-dom/vitest'

// jsdom has no ResizeObserver. Recharts needs one for ResponsiveContainer.
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}
