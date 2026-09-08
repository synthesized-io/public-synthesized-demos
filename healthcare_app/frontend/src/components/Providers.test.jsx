import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material'
import { DatabaseProvider } from '../context/DatabaseContext'
import Providers from './Providers'

// Providers loads its list with the fetch API, not with axios.
const PROVIDER_ROWS = [
  {
    providerId: 1,
    firstName: 'Ada',
    lastName: 'Lovelace',
    specialization: 'Cardiology',
    phone: '555-0101',
    email: 'ada@example.com',
    licenseNumber: 'LIC-001',
  },
  {
    providerId: 2,
    firstName: 'Grace',
    lastName: 'Hopper',
    specialization: 'Neurology',
    phone: '555-0102',
    email: 'grace@example.com',
    licenseNumber: 'LIC-002',
  },
]

function renderProviders() {
  return render(
    <ThemeProvider theme={createTheme()}>
      <DatabaseProvider>
        <MemoryRouter initialEntries={['/providers']}>
          <Providers refreshTrigger={0} />
        </MemoryRouter>
      </DatabaseProvider>
    </ThemeProvider>,
  )
}

describe('Providers', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows the rows that the API returns', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => PROVIDER_ROWS,
    })

    renderProviders()

    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument()
    expect(await screen.findByText('Grace Hopper')).toBeInTheDocument()
    expect(screen.getByText('Cardiology')).toBeInTheDocument()
    expect(screen.getByText('LIC-002')).toBeInTheDocument()
  })

  it('asks the API for the selected database', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => PROVIDER_ROWS,
    })

    renderProviders()
    await screen.findByText('Ada Lovelace')

    const requestedUrl = fetch.mock.calls[0][0]
    expect(requestedUrl).toContain('/api/providers?')
    expect(requestedUrl).toContain('database=PROD')
  })

  it('shows an error and stays usable when the API call fails', async () => {
    fetch.mockRejectedValue(new Error('network down'))

    renderProviders()

    expect(await screen.findByText('Failed to fetch providers')).toBeInTheDocument()
    // The component must not crash. The heading and the empty row stay on screen.
    expect(screen.getByText('Provider Management')).toBeInTheDocument()
    expect(screen.getByText('No providers found')).toBeInTheDocument()
  })
})
