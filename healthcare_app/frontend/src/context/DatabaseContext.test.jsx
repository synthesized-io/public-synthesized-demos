import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { DatabaseProvider, useDatabase, DATABASE_OPTIONS } from './DatabaseContext'

const wrapper = ({ children }) => <DatabaseProvider>{children}</DatabaseProvider>

describe('DATABASE_OPTIONS', () => {
  it('holds SEED, TESTING and PROD', () => {
    expect(DATABASE_OPTIONS).toEqual({
      SEED: 'SEED',
      TESTING: 'TESTING',
      PROD: 'PROD',
    })
  })
})

describe('DatabaseProvider', () => {
  it('starts with PROD as the selected database', () => {
    const { result } = renderHook(() => useDatabase(), { wrapper })

    expect(result.current.selectedDatabase).toBe(DATABASE_OPTIONS.PROD)
  })

  it('changes the selected database when setSelectedDatabase runs', () => {
    const { result } = renderHook(() => useDatabase(), { wrapper })

    act(() => {
      result.current.setSelectedDatabase(DATABASE_OPTIONS.TESTING)
    })
    expect(result.current.selectedDatabase).toBe('TESTING')

    act(() => {
      result.current.setSelectedDatabase(DATABASE_OPTIONS.SEED)
    })
    expect(result.current.selectedDatabase).toBe('SEED')
  })
})

describe('useDatabase', () => {
  it('throws if there is no DatabaseProvider above it', () => {
    // React logs the failed render and jsdom reports the error again on
    // window. Hide both to keep the test output clean.
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const swallow = (event) => event.preventDefault()
    window.addEventListener('error', swallow)
    try {
      expect(() => renderHook(() => useDatabase())).toThrow(
        'useDatabase must be used within a DatabaseProvider',
      )
    } finally {
      window.removeEventListener('error', swallow)
      consoleError.mockRestore()
    }
  })
})
