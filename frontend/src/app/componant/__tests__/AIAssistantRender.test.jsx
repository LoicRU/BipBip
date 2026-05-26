import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AIAssistant } from '../AIAssistant';

describe('AIAssistant component', () => {
  it('renders the IA assistant header and tabs', () => {
    render(<AIAssistant />);

    expect(screen.getByRole('heading', { name: /cv & lettres de motivation/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /générateur de cv/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /lettre de motivation/i })).toBeInTheDocument();
  });
});
