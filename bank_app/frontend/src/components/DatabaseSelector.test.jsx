import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material';
import { DatabaseProvider } from '../context/DatabaseContext';
import DatabaseSelector from './DatabaseSelector';

// The component reads the MUI theme, so it needs a ThemeProvider.
function renderSelector() {
  return render(
    <ThemeProvider theme={createTheme()}>
      <DatabaseProvider>
        <DatabaseSelector />
      </DatabaseProvider>
    </ThemeProvider>
  );
}

describe('DatabaseSelector', () => {
  it('shows the current database', () => {
    renderSelector();

    expect(screen.getByRole('combobox')).toHaveTextContent('Bank Testing');
  });

  it('lists the three databases when it is open', async () => {
    const user = userEvent.setup();
    renderSelector();

    await user.click(screen.getByRole('combobox'));

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
    expect(options.map((option) => option.textContent)).toEqual([
      'Bank Seed',
      'Bank Prod',
      'Bank Testing',
    ]);
  });

  it('shows the new database after the user selects one', async () => {
    const user = userEvent.setup();
    renderSelector();

    await user.click(screen.getByRole('combobox'));
    const list = screen.getByRole('listbox');
    await user.click(within(list).getByRole('option', { name: 'Bank Seed' }));

    expect(screen.getByRole('combobox')).toHaveTextContent('Bank Seed');
  });
});
