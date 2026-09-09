// Vitest runs this file before each test file.
// It adds the jest-dom matchers, for example toBeInTheDocument().
import '@testing-library/jest-dom/vitest';

// jsdom has no ResizeObserver. The recharts container needs one.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}

    unobserve() {}

    disconnect() {}
  };
}
