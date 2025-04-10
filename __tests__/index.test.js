import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../src/pages/index';

jest.mock('next/font/google', () => ({
  Inter: () => ({ className: 'mock-font-class' }),
}));

describe('Home Page', () => {
  it('renders welcome message', () => {
    render(<Home />);
    const heading = screen.getByText(/Welcome to Step Towards the Light/i);
    expect(heading).toBeInTheDocument();
  });
});
