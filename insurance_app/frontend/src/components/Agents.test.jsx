import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import axios from 'axios';
import { DatabaseProvider } from '../context/DatabaseContext';
import Agents from './Agents';

vi.mock('axios');

// GET /api/agents returns a bare array. See fetchAgents in Agents.jsx.
const AGENT_FIXTURE = [
  {
    agentId: 1,
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.test',
    phone: '555-0101',
    region: 'North',
    status: 'Active',
  },
  {
    agentId: 2,
    firstName: 'Grace',
    lastName: 'Hopper',
    email: 'grace@example.test',
    phone: '555-0102',
    region: 'South',
    status: 'Inactive',
  },
];

function renderAgents() {
  return render(
    <ThemeProvider theme={createTheme()}>
      <DatabaseProvider>
        <Agents refreshTrigger={0} />
      </DatabaseProvider>
    </ThemeProvider>
  );
}

describe('Agents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockResolvedValue({ data: [] });
    axios.post.mockResolvedValue({ data: {} });
    axios.put.mockResolvedValue({ data: {} });
    axios.delete.mockResolvedValue({ data: {} });
  });

  it('shows the rows that the API returns', async () => {
    axios.get.mockResolvedValue({ data: AGENT_FIXTURE });
    renderAgents();

    expect(await screen.findByText('Lovelace')).toBeInTheDocument();
    expect(screen.getByText('ada@example.test')).toBeInTheDocument();
    expect(screen.getByText('Hopper')).toBeInTheDocument();
    expect(screen.getByText('grace@example.test')).toBeInTheDocument();
    expect(screen.getByText('North')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('requests the agents of the selected database', async () => {
    axios.get.mockResolvedValue({ data: AGENT_FIXTURE });
    renderAgents();

    await screen.findByText('Lovelace');
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/agents?database=SEED')
    );
  });

  it('shows an error and does not stop when the API call fails', async () => {
    axios.get.mockRejectedValue(new Error('network down'));
    renderAgents();

    expect(await screen.findByText('Failed to fetch agents')).toBeInTheDocument();
    // The page frame is still on screen, so the component did not stop.
    expect(screen.getByText('Agent Management')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Agent/ })).toBeInTheDocument();
  });
});
