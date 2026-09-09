import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material'
import { DatabaseProvider } from '../context/DatabaseContext'
import DatabaseSelector from './DatabaseSelector'

// The component calls useTheme, so give it a theme as well as the database context.
function renderSelector() {
  return render(
    <ThemeProvider theme={createTheme()}>
      <DatabaseProvider>
        <DatabaseSelector />
      </DatabaseProvider>
    </ThemeProvider>,
  )
}

describe('DatabaseSelector', () => {
  it('shows the current database as a friendly label', () => {
    renderSelector()

    // PROD is the start value. The component shows it as "Production".
    expect(screen.getByRole('combobox')).toHaveTextContent('Production')
  })

  it('shows the three database options when it is open', async () => {
    const user = userEvent.setup()
    renderSelector()

    await user.click(screen.getByRole('combobox'))

    const options = within(screen.getByRole('listbox')).getAllByRole('option')
    expect(options).toHaveLength(3)
    expect(options.map((option) => option.getAttribute('data-value'))).toEqual([
      'SEED',
      'PROD',
      'TESTING',
    ])
  })

  it('shows the new value after the user picks another database', async () => {
    const user = userEvent.setup()
    renderSelector()

    await user.click(screen.getByRole('combobox'))
    await user.click(within(screen.getByRole('listbox')).getByRole('option', { name: /Seed/ }))

    expect(screen.getByRole('combobox')).toHaveTextContent('Seed')
    expect(screen.getByRole('combobox')).not.toHaveTextContent('Production')
  })
})
