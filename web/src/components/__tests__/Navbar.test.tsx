import React from 'react';
/** @jest-environment jsdom */
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../../test-utils';
import { AuthProvider } from '../../context/AuthContext';
import Navbar from '../Navbar';

// Mock the useAuth hook
jest.mock('../../context/AuthContext', () => ({
  ...jest.requireActual('../../context/AuthContext'),
  useAuth: () => ({
    isAuthenticated: false,
    isAdmin: false,
    user: null,
    logout: jest.fn(),
  }),
}));

describe('Navbar', () => {
  it('renders the logo', () => {
    render(
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    );
    const logoElements = screen.getAllByText(/Cinema/i);
    expect(logoElements.length).toBeGreaterThan(0);
  });

  it('renders public navigation links', () => {
    render(
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    );
    expect(screen.getAllByRole('link', { name: /Movies/i })[0]).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Book Ticket/i })).toBeInTheDocument();
  });

  it('shows login button when user is not authenticated', () => {
    render(
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    );
    expect(screen.getByRole('link', { name: /Login/i })).toBeInTheDocument();
  });

  it('opens mobile menu when menu icon is clicked', () => {
    render(
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    );
    const menuButton = screen.getByLabelText(/menu/i);
    fireEvent.click(menuButton);
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });
});

// Test with authenticated user
describe('Navbar with authenticated user', () => {
  beforeEach(() => {
    jest.spyOn(require('../../context/AuthContext'), 'useAuth').mockImplementation(() => ({
      isAuthenticated: true,
      isAdmin: false,
      user: { name: 'John Doe' },
      logout: jest.fn(),
    }));
  });

  it('shows user avatar when authenticated', () => {
    render(
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    );
    const avatar = screen.getByText('J');
    expect(avatar).toBeInTheDocument();
  });
});

// Test with admin user
describe('Navbar with admin user', () => {
  beforeEach(() => {
    jest.spyOn(require('../../context/AuthContext'), 'useAuth').mockImplementation(() => ({
      isAuthenticated: true,
      isAdmin: true,
      user: { name: 'Admin User' },
      logout: jest.fn(),
    }));
  });

  it('shows admin navigation links when user is admin', () => {
    render(
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    );
    expect(screen.getAllByRole('link', { name: /Manage Screens/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Manage Movies/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Manage Showtimes/i })[0]).toBeInTheDocument();
  });
}); 