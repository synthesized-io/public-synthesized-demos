#!/usr/bin/env node
/**
 * Browser smoke test for a production frontend build.
 *
 * Why this exists
 * ---------------
 * The Vitest suites render through the Vite dev transform, not through the
 * production bundle. The end-to-end script checks that nginx returns 200 and
 * that index.html points at a large asset. Neither one executes the bundled
 * JavaScript.
 *
 * A real defect slipped through both gates. Under Vite 8 a deep default import
 * of a MUI icon resolved to { default: Component } instead of the component,
 * React threw error #130, and all three applications rendered a blank page.
 * Every check stayed green.
 *
 * This script closes that gap. It loads the real build in Chromium, walks every
 * route, and fails on a blank page or on any page error. It is the only check
 * in the repository that runs the shipped JavaScript.
 *
 * Usage
 * -----
 *   node scripts/browser-smoke.mjs <bank|healthcare|insurance>
 *
 * The application must be built first (`npm run build` in its frontend
 * directory). No backend is needed: the API calls fail, and the page must still
 * render its shell. That is the point, because a blank page and a page with no
 * data look the same to an HTTP status check.
 *
 * Exit code is 0 when every route passes, 1 otherwise.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const APPS = {
  bank: {
    dir: 'bank_app/frontend',
    routes: ['/', '/customers', '/accounts', '/transactions', '/branches'],
    expect: 'Bank',
  },
  healthcare: {
    dir: 'healthcare_app/frontend',
    routes: ['/', '/patients', '/appointments', '/prescriptions', '/providers', '/admin'],
    expect: 'Healthcare',
  },
  insurance: {
    dir: 'insurance_app/frontend',
    routes: ['/', '/policyholders', '/policies', '/claims', '/agents', '/admin'],
    expect: 'Insurance',
  },
};

// A rendered shell is well over this. A React error boundary teardown leaves
// almost nothing, which is exactly what we are trying to catch.
const MIN_TEXT_LENGTH = 120;

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
};

/** Serve the build directory, falling back to index.html so client routes work. */
function serveBuild(root) {
  const server = createServer(async (req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);

    // Refuse API calls with a gateway error, the way nginx behaves when the
    // backend is down. Falling back to index.html here would answer an API
    // call with HTML and a 200, and the component would then try to iterate a
    // string. That is a fault in the harness, not in the application.
    if (urlPath.startsWith('/api/') || urlPath.startsWith('/swagger-ui/') || urlPath === '/api-docs') {
      res.writeHead(502, { 'Content-Type': 'text/plain' }).end('no backend in this check');
      return;
    }

    let file = join(root, urlPath);
    if (!existsSync(file) || urlPath.endsWith('/')) file = join(root, 'index.html');
    try {
      const body = await readFile(file);
      res.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404).end('not found');
    }
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok(server)));
}

const app = process.argv[2];
if (!APPS[app]) {
  console.error(`Usage: node scripts/browser-smoke.mjs <${Object.keys(APPS).join('|')}>`);
  process.exit(2);
}

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const appDir = join(repoRoot, APPS[app].dir);
const buildDir = join(appDir, 'build');
if (!existsSync(join(buildDir, 'index.html'))) {
  console.error(`No build found at ${buildDir}. Run "npm run build" in ${APPS[app].dir} first.`);
  process.exit(2);
}

// Resolve playwright from the application's own node_modules, where it is a
// devDependency. This script sits in scripts/, which has no node_modules of
// its own, so a plain `import 'playwright'` would depend on where npm happened
// to put the package. That is how an earlier version of this check passed by
// accident against a package installed outside the repository.
let chromium;
try {
  chromium = createRequire(join(appDir, 'package.json'))('playwright').chromium;
} catch {
  console.error(
    `Cannot load playwright from ${appDir}.\n` +
    `Run "npm ci" and "npx playwright install chromium" in ${APPS[app].dir}.`
  );
  process.exit(2);
}

const server = await serveBuild(buildDir);
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();

let pass = 0;
let fail = 0;

console.log(`\nBrowser smoke test: ${app}  (${base})\n`);

for (const route of APPS[app].routes) {
  const page = await browser.newPage();
  const errors = [];

  // A React "element type is invalid" throw arrives as a pageerror. This is
  // the signal that the old checks could not see.
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message.split('\n')[0]}`));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    // Failed API calls are expected: no backend runs here.
    if (/Failed to load resource|net::ERR|favicon|logo192|manifest/i.test(t)) return;
    errors.push(`console.error: ${t.split('\n')[0]}`);
  });

  await page.goto(`${base}${route}`, { waitUntil: 'load' });
  // Give React a moment to mount and to throw if it is going to.
  await page.waitForTimeout(600);

  const text = (await page.evaluate(() => document.body.innerText || '')).trim();
  const rootChildren = await page.evaluate(
    () => document.getElementById('root')?.children.length ?? 0
  );

  const problems = [];
  if (errors.length) problems.push(errors.join(' | '));
  if (text.length < MIN_TEXT_LENGTH) {
    problems.push(`only ${text.length} chars of text (want at least ${MIN_TEXT_LENGTH})`);
  }
  if (rootChildren === 0) problems.push('#root has no child elements');

  if (problems.length) {
    console.log(`  FAIL  ${route}\n          ${problems.join('\n          ')}`);
    fail++;
  } else {
    console.log(`  PASS  ${route}  (${text.length} chars, ${rootChildren} root child)`);
    pass++;
  }
  await page.close();
}

// The shell text must actually be the right application, not a stray page.
const page = await browser.newPage();
await page.goto(base, { waitUntil: 'load' });
await page.waitForTimeout(400);
const body = await page.evaluate(() => document.body.innerText || '');
if (body.includes(APPS[app].expect)) {
  console.log(`  PASS  shell shows "${APPS[app].expect}"`);
  pass++;
} else {
  console.log(`  FAIL  shell does not show "${APPS[app].expect}"`);
  fail++;
}
await page.close();

await browser.close();
server.close();

console.log(`\nRESULT: ${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
