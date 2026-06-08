import { beforeEach, describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from './LoginPage';
import { renderWithProviders } from '@/test/renderWithProviders';

describe('LoginPage (integration with mock API)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the sign-in form', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows an error message when credentials are rejected', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText('Email address'), 'wrong@eaglebank.test');
    await user.type(screen.getByLabelText('Password'), 'badpassword');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/incorrect email or password/i);
    expect(localStorage.getItem('eaglebank.token')).toBeNull();
  });

  it('persists a session token on successful login', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText('Email address'), 'george@eaglebank.test');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(localStorage.getItem('eaglebank.token')).not.toBeNull();
    });
    // No error banner on the happy path.
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
