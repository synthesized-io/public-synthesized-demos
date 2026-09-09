import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { DatabaseProvider } from '../context/DatabaseContext';
import DatabaseSelector from './DatabaseSelector';

// DatabaseSelector calls useTheme, so it needs a ThemeProvider.
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
    expect(screen.getByRole('combobox')).toHaveTextContent('Seed');
  });

  it('shows all three databases when it is open', async () => {
    const user = userEvent.setup();
    renderSelector();

    await user.click(screen.getByRole('combobox'));

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
    expect(within(options[0]).getByText('Seed')).toBeInTheDocument();
    expect(within(options[1]).getByText('Production')).toBeInTheDocument();
    expect(within(options[2]).getByText('Testing')).toBeInTheDocument();
  });

  it('changes the shown value when you select a different database', async () => {
    const user = userEvent.setup();
    renderSelector();

    const combobox = screen.getByRole('combobox');
    expect(combobox).toHaveTextContent('Seed');

    await user.click(combobox);
    await user.click(screen.getByRole('option', { name: /Production/ }));

    expect(screen.getByRole('combobox')).toHaveTextContent('Production');
  });
});
