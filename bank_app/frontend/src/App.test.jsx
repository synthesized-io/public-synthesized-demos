import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

// The child components call the API when they mount.
// The mock keeps the test off the network.
const axiosMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  remove: vi.fn(),
}));

vi.mock('axios', () => ({
  default: {
    get: axiosMock.get,
    post: axiosMock.post,
    put: axiosMock.put,
    delete: axiosMock.remove,
  },
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Home reads /api/statistics and /api/statistics/account-status-counts.
    // Both endpoints send an object.
    axiosMock.get.mockResolvedValue({ data: {} });
    axiosMock.post.mockResolvedValue({ data: {} });
    axiosMock.put.mockResolvedValue({ data: {} });
    axiosMock.remove.mockResolvedValue({ data: {} });
  });

  it('shows the application bar title', async () => {
    render(<App />);

    expect(await screen.findByText('Blank Back Office')).toBeInTheDocument();
  });

  it('shows a tab for each section', async () => {
    render(<App />);

    expect(await screen.findByRole('tab', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Customers' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Accounts' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Transactions' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Branches' })).toBeInTheDocument();
  });
});
