import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import axios from 'axios';
import App from './App';

// App renders Home on the "/" route, and Home calls axios on mount.
// Mock axios so the test does not use the network.
vi.mock('axios');

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockResolvedValue({ data: {} });
  });

  it('shows the application bar title for the dashboard route', () => {
    // App supplies its own Router, ThemeProvider and DatabaseProvider.
    render(<App />);
    expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
  });

  it('shows the product name in the sidebar', () => {
    render(<App />);
    expect(screen.getByText('SecureLife')).toBeInTheDocument();
  });
});
