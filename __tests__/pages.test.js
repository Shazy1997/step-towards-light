import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import About from '../src/pages/about';
import Community from '../src/pages/community';
import Content from '../src/pages/content';
import Events from '../src/pages/events';
import Shop from '../src/pages/shop';

jest.mock('next/font/google', () => ({
  Inter: () => ({ className: 'mock-font-class' }),
}));

describe('Page Components', () => {
  describe('About Page', () => {
    it('renders about section', () => {
      render(<About />);
      expect(screen.getByRole('heading', { name: /About Us/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Our Mission/i })).toBeInTheDocument();
    });
  });

  describe('Community Page', () => {
    it('renders community sections', () => {
      render(<Community />);
      expect(screen.getByRole('heading', { name: /Our Community/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Join Our Discord/i })).toBeInTheDocument();
    });
  });

  describe('Content Page', () => {
    it('renders content sections', () => {
      render(<Content />);
      expect(screen.getByRole('heading', { name: /Islamic Content/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Featured Videos/i })).toBeInTheDocument();
    });
  });

  describe('Events Page', () => {
    it('renders events sections', () => {
      render(<Events />);
      expect(screen.getByRole('heading', { name: /Events Calendar/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Upcoming Events/i })).toBeInTheDocument();
    });
  });

  describe('Shop Page', () => {
    it('renders shop sections', () => {
      render(<Shop />);
      expect(screen.getByRole('heading', { name: /Islamic Shop/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Shop Coming Soon/i })).toBeInTheDocument();
    });
  });
});
