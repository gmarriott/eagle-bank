import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/** Browser worker, started in main.tsx for development. */
export const worker = setupWorker(...handlers);
