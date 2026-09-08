import React from 'react';
import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import {
  DATABASE_OPTIONS,
  DatabaseProvider,
  useDatabase,
} from './DatabaseContext';

function wrapper({ children }) {
  return <DatabaseProvider>{children}</DatabaseProvider>;
}

describe('DATABASE_OPTIONS', () => {
  it('holds the three databases', () => {
    expect(DATABASE_OPTIONS).toEqual({
      SEED: 'SEED',
      TESTING: 'TESTING',
      PROD: 'PROD',
    });
  });
});

describe('DatabaseProvider', () => {
  it('starts with TESTING as the selected database', () => {
    const { result } = renderHook(() => useDatabase(), { wrapper });

    expect(result.current.selectedDatabase).toBe(DATABASE_OPTIONS.TESTING);
  });

  it('changes the selected database with setSelectedDatabase', () => {
    const { result } = renderHook(() => useDatabase(), { wrapper });

    act(() => {
      result.current.setSelectedDatabase(DATABASE_OPTIONS.PROD);
    });

    expect(result.current.selectedDatabase).toBe(DATABASE_OPTIONS.PROD);
  });
});
