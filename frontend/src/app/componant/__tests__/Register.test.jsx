import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Register } from '../Register';

vi.mock('../../context/AppContext', () => ({
  useApp: () => ({
    register: vi.fn(),
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

describe('Register component', () => {
  it('renders the registration page and role selection buttons', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /bipbip/i })).toBeInTheDocument();
    const buttons = screen.getAllByRole('button', { name: /continuer/i });
    expect(buttons).toHaveLength(2);
  });
});
