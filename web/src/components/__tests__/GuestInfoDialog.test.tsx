import React from 'react';
/** @jest-environment jsdom */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GuestInfoDialog from '../GuestInfoDialog';

describe('GuestInfoDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSubmit.mockClear();
  });

  it('renders all form fields', () => {
    render(
      <GuestInfoDialog
        open={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mobile Number/i)).toBeInTheDocument();
    expect(screen.getByText('Continue')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('handles form submission with valid data', async () => {
    render(
      <GuestInfoDialog
        open={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    await userEvent.type(screen.getByLabelText(/Full Name/i), 'John Doe');
    await userEvent.type(screen.getByLabelText(/Email/i), 'john@example.com');
    await userEvent.type(screen.getByLabelText(/Mobile Number/i), '1234567890');

    await userEvent.click(screen.getByText('Continue'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        mobile: '1234567890'
      });
    });
  });

  it('shows validation errors for empty fields', async () => {
    render(
      <GuestInfoDialog
        open={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    await userEvent.click(screen.getByText('Continue'));

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates email format', async () => {
    render(
      <GuestInfoDialog
        open={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    await userEvent.type(screen.getByLabelText(/Full Name/i), 'John Doe');
    await userEvent.type(screen.getByLabelText(/Email/i), 'invalid-email');
    await userEvent.click(screen.getByText('Continue'));

    await waitFor(() => {
      expect(screen.getByText('Valid email is required')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates phone number format', async () => {
    render(
      <GuestInfoDialog
        open={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    await userEvent.type(screen.getByLabelText(/Full Name/i), 'John Doe');
    await userEvent.type(screen.getByLabelText(/Email/i), 'john@example.com');
    await userEvent.type(screen.getByLabelText(/Mobile Number/i), '123');
    await userEvent.click(screen.getByText('Continue'));

    await waitFor(() => {
      expect(screen.getByText('Valid 10-digit mobile number is required')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('closes dialog when cancel is clicked', async () => {
    render(
      <GuestInfoDialog
        open={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    await userEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('clears form after successful submission', async () => {
    render(
      <GuestInfoDialog
        open={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const nameInput = screen.getByLabelText(/Full Name/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const mobileInput = screen.getByLabelText(/Mobile Number/i);

    await userEvent.type(nameInput, 'John Doe');
    await userEvent.type(emailInput, 'john@example.com');
    await userEvent.type(mobileInput, '1234567890');
    await userEvent.click(screen.getByText('Continue'));

    await waitFor(() => {
      expect(nameInput).toHaveValue('');
      expect(emailInput).toHaveValue('');
      expect(mobileInput).toHaveValue('');
    });
  });
}); 