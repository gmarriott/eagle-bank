import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/** Tests run against the same mock backend. */
export const server = setupServer(...handlers);
