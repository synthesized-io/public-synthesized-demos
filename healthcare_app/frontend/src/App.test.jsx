import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import axios from 'axios'
import App from './App'

// Home calls the statistics API when it mounts. Mock axios so the test
// does no network request.
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    axios.get.mockResolvedValue({ data: {} })
  })

  it('shows the application bar title', async () => {
    // App supplies its own Router, ThemeProvider and DatabaseProvider.
    render(<App />)

    expect(await screen.findByText('HealthCare EMR')).toBeInTheDocument()
  })

  it('shows the selected database in the header and the footer', async () => {
    render(<App />)

    expect(await screen.findByText('DB: PROD')).toBeInTheDocument()
    expect(screen.getByText('Connected to: PROD')).toBeInTheDocument()
  })

  it('shows the ribbon navigation buttons', async () => {
    render(<App />)

    for (const label of ['Patients', 'Schedule', 'Prescriptions', 'Providers', 'Admin']) {
      expect(await screen.findByRole('button', { name: label })).toBeInTheDocument()
    }
  })
})
