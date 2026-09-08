import React from 'react'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material'
import axios from 'axios'
import viteConfig from '../vite.config.js'
import { DatabaseProvider } from './context/DatabaseContext'
import Home from './components/Home'

// Six components read process.env.REACT_APP_BACKEND_URL, and vite.config.js
// replaces it at build time through `define`. That is the deploy contract for
// the Docker image, which passes the value as a build argument.
//
// Note on what this file can and cannot prove. Vitest does NOT apply the
// `define` block to test files, so under test the components do a live read of
// process.env. A production build DOES apply it: a build with the variable set
// leaves no "REACT_APP_BACKEND_URL" text in the bundle. So these tests prove
// the contract from both ends:
//   1. The components read the variable and do not hold a hardcoded host.
//   2. vite.config.js still declares the `define` that substitutes it.
// Together those two facts are what make the Docker build argument work.

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

// Use a computed key here. `define` rewrites the dotted name in the source
// text. A direct assignment to that name can break if `define` is ever
// switched on for tests.
const ENV_KEY = 'REACT_APP_BACKEND_URL'

const SRC_DIR = path.dirname(fileURLToPath(import.meta.url))
const COMPONENTS_THAT_CALL_THE_BACKEND = [
  'Admin.jsx',
  'Appointments.jsx',
  'Home.jsx',
  'Patients.jsx',
  'Prescriptions.jsx',
  'Providers.jsx',
]

function renderHome() {
  return render(
    <ThemeProvider theme={createTheme()}>
      <DatabaseProvider>
        <MemoryRouter>
          <Home isVisible refreshTrigger={0} />
        </MemoryRouter>
      </DatabaseProvider>
    </ThemeProvider>,
  )
}

describe('backend URL: what the component does', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    axios.get.mockResolvedValue({ data: {} })
    delete process.env[ENV_KEY]
  })

  afterEach(() => {
    delete process.env[ENV_KEY]
  })

  it('puts the configured backend URL in front of the API path', async () => {
    process.env[ENV_KEY] = 'https://backend.example.test'

    renderHome()
    await waitFor(() => expect(axios.get).toHaveBeenCalled())

    expect(axios.get.mock.calls[0][0]).toBe(
      'https://backend.example.test/api/statistics?database=PROD',
    )
  })

  it('uses a relative path when no backend URL is configured', async () => {
    renderHome()
    await waitFor(() => expect(axios.get).toHaveBeenCalled())

    for (const call of axios.get.mock.calls) {
      expect(call[0]).toMatch(/^\/api\//)
      expect(call[0]).not.toMatch(/^https?:\/\//)
      expect(call[0]).not.toContain('localhost')
    }
  })
})

describe('backend URL: the build-time contract', () => {
  it('vite.config.js maps the variable through define', () => {
    expect(viteConfig.define).toBeDefined()
    expect(viteConfig.define).toHaveProperty('process.env.REACT_APP_BACKEND_URL')

    // The mapped value must be a JSON string, because it replaces an
    // expression in the source text.
    const mapped = viteConfig.define['process.env.REACT_APP_BACKEND_URL']
    expect(typeof mapped).toBe('string')
    expect(() => JSON.parse(mapped)).not.toThrow()
    expect(typeof JSON.parse(mapped)).toBe('string')
  })

  it('keeps the CRA output directory that the Dockerfile copies', () => {
    expect(viteConfig.build.outDir).toBe('build')
  })

  it('every backend component reads the variable and hardcodes no host', () => {
    for (const file of COMPONENTS_THAT_CALL_THE_BACKEND) {
      const source = fs.readFileSync(path.join(SRC_DIR, 'components', file), 'utf8')

      expect(source, `${file} must read the backend URL from the environment`).toContain(
        'process.env.REACT_APP_BACKEND_URL',
      )
      // A request path must not contain an absolute backend host.
      expect(source, `${file} must not hardcode a backend host`).not.toMatch(
        /["'`]https?:\/\/[^"'`]*\/api\//,
      )
    }
  })
})
