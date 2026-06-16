import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../src/App';

describe('App', () => {
  it('renders upload and library surfaces', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Smooth Motion Packages' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upload package/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search packages')).toBeInTheDocument();
  });
});
