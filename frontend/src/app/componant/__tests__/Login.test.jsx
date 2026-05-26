import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Login } from '../Login';

vi.mock('../../context/AppContext', () => ({
  useApp: () => ({
    login: vi.fn(),
    authReady: true,
    isAuthenticated: false,
    userType: null,
    theme: 'light',
    toggleTheme: vi.fn(),
    logout: vi.fn(),
    updateCurrentUser: vi.fn(),
    authError: '',
    setAuthError: vi.fn(),
  }),
}));

describe('Login component', () => {
  it('renders the login page and submit button', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /connexion/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
  });
});
