import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { DatabaseProvider } from '../context/DatabaseContext';
import Branches from './Branches';

// GET /api/branches sends a bare array. The other verbs are here
// so that no call in the component gets an undefined result.
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

const BRANCH_ROWS = [
  { branch_id: 1, name: 'Kings Cross', region: 'North', manager_name: 'Ada Lovelace' },
  { branch_id: 2, name: 'Waterloo', region: 'South', manager_name: 'Alan Turing' },
  { branch_id: 3, name: 'Paddington', region: 'West', manager_name: 'Grace Hopper' },
];

function renderBranches() {
  return render(
    <ThemeProvider theme={createTheme()}>
      <DatabaseProvider>
        <Branches refreshTrigger={0} />
      </DatabaseProvider>
    </ThemeProvider>
  );
}

describe('Branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.post.mockResolvedValue({ data: {} });
    axiosMock.put.mockResolvedValue({ data: {} });
    axiosMock.remove.mockResolvedValue({ data: {} });
  });

  it('shows the branches that the API sends', async () => {
    axiosMock.get.mockResolvedValue({ data: BRANCH_ROWS });

    renderBranches();

    expect(await screen.findByText('Kings Cross')).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Waterloo')).toBeInTheDocument();
    expect(screen.getByText('Paddington')).toBeInTheDocument();
  });

  it('asks the API for the selected database', async () => {
    axiosMock.get.mockResolvedValue({ data: BRANCH_ROWS });

    renderBranches();

    await screen.findByText('Kings Cross');
    expect(axiosMock.get).toHaveBeenCalledWith('/api/branches?database=TESTING');
  });

  it('shows an error and stays on screen when the API call fails', async () => {
    axiosMock.get.mockRejectedValue(new Error('network down'));

    renderBranches();

    expect(await screen.findByText('Failed to fetch branches')).toBeInTheDocument();
    // The component must not crash. Its heading and its table are still there.
    expect(screen.getByText('Branch Management')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.queryByText('Kings Cross')).not.toBeInTheDocument();
  });
});
