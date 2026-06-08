import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from '@/mocks/server';

// Start the mock API once for the whole suite. `error` on unhandled requests
// surfaces accidental real network calls instead of letting them hang.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset any per-test handler overrides and unmount React trees between tests.
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

afterAll(() => server.close());
