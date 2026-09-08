import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { DatabaseProvider, useDatabase, DATABASE_OPTIONS } from './DatabaseContext';

const wrapper = ({ children }) => <DatabaseProvider>{children}</DatabaseProvider>;

describe('DATABASE_OPTIONS', () => {
  it('holds SEED, TESTING and PROD', () => {
    expect(DATABASE_OPTIONS).toEqual({
      SEED: 'SEED',
      TESTING: 'TESTING',
      PROD: 'PROD',
    });
  });
});

describe('DatabaseProvider', () => {
  it('starts with SEED as the selected database', () => {
    const { result } = renderHook(() => useDatabase(), { wrapper });
    expect(result.current.selectedDatabase).toBe(DATABASE_OPTIONS.SEED);
  });

  it('changes the selected database when setSelectedDatabase is called', () => {
    const { result } = renderHook(() => useDatabase(), { wrapper });

    act(() => {
      result.current.setSelectedDatabase(DATABASE_OPTIONS.TESTING);
    });
    expect(result.current.selectedDatabase).toBe(DATABASE_OPTIONS.TESTING);

    act(() => {
      result.current.setSelectedDatabase(DATABASE_OPTIONS.PROD);
    });
    expect(result.current.selectedDatabase).toBe(DATABASE_OPTIONS.PROD);
  });
});
