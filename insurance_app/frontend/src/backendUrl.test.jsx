import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import axios from 'axios';
import { DatabaseProvider } from './context/DatabaseContext';
import Agents from './components/Agents';

vi.mock('axios');

// This file tests the deploy contract of the app.
//
// Six components read process.env.REACT_APP_BACKEND_URL. A browser bundle has
// no process.env, so the `define` block in vite.config.js replaces that
// expression at build time. The Dockerfile gives the value as a build
// argument. If the `define` block goes away, the built app requests the wrong
// host, and the build still succeeds with no error.
//
// Note on Vitest: Vite treats a `define` key that starts with `process.env.`
// as a special case. In a browser build it is a static text replacement. In a
// Node environment such as Vitest, Vite instead writes the value into
// process.env. The result for these tests is the same value, but the
// components read it at run time. A test therefore cannot show the static
// replacement. It can show two things that matter more:
//   1. The components build the URL from the variable, not from a hardcoded
//      host. The first three tests change the variable and show that the URL
//      follows it.
//   2. vite.config.js still declares the `define` block. The last test reads
//      the file, because a missing `define` block is the failure that the
//      build does not report.

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

async function requestedUrl() {
  renderAgents();
  await screen.findByText('Lovelace');
  return axios.get.mock.calls[0][0];
}

describe('REACT_APP_BACKEND_URL contract', () => {
  let originalValue;

  beforeEach(() => {
    originalValue = process.env.REACT_APP_BACKEND_URL;
    vi.clearAllMocks();
    axios.get.mockResolvedValue({ data: AGENT_FIXTURE });
    axios.post.mockResolvedValue({ data: {} });
    axios.put.mockResolvedValue({ data: {} });
    axios.delete.mockResolvedValue({ data: {} });
  });

  afterEach(() => {
    if (originalValue === undefined) {
      delete process.env.REACT_APP_BACKEND_URL;
    } else {
      process.env.REACT_APP_BACKEND_URL = originalValue;
    }
  });

  it('puts the configured backend URL in front of the API path', async () => {
    process.env.REACT_APP_BACKEND_URL = 'https://insurance-api.example.test';

    const url = await requestedUrl();

    // This fails if a component hardcodes the host instead of reading the
    // variable.
    expect(url).toBe('https://insurance-api.example.test/api/agents?database=SEED');
  });

  it('follows a different value of the variable', async () => {
    process.env.REACT_APP_BACKEND_URL = 'https://other-host.example.test';

    const url = await requestedUrl();

    expect(url).toBe('https://other-host.example.test/api/agents?database=SEED');
  });

  it('gives a relative path when the variable is empty', async () => {
    // nginx serves the app and the API on one origin, so an empty value is
    // the correct default.
    process.env.REACT_APP_BACKEND_URL = '';

    const url = await requestedUrl();

    expect(url).toBe('/api/agents?database=SEED');
    expect(url).not.toContain('localhost');
    expect(url).not.toContain(':8080');
  });

  it('keeps the build-time define in vite.config.js', () => {
    // The Docker deploy depends on this block. A browser bundle has no
    // process.env, so the components get an undefined host without it.
    // Derive the directory from import.meta.url. import.meta.dirname works
    // on Node 20.11 and later, but this form works everywhere and matches
    // the sibling healthcare test.
    const here = dirname(fileURLToPath(import.meta.url));
    const config = readFileSync(resolve(here, '..', 'vite.config.js'), 'utf8');

    expect(config).toContain("'process.env.REACT_APP_BACKEND_URL'");
    expect(config).toContain(
      "JSON.stringify(process.env.REACT_APP_BACKEND_URL || '')"
    );
  });
});
