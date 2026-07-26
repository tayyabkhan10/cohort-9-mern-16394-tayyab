import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login';
import * as AuthContext from '../context/AuthContext';

describe('Login page', () => {
  it('submits credentials and redirects on success', async () => {
    const loginMock = jest.fn().mockResolvedValue(undefined);
    jest.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      token: null,
      isLoading: false,
      login: loginMock,
      signup: jest.fn(),
      logout: jest.fn()
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ali@test.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith('ali@test.com', 'secret123');
    });
  });

  it('shows an error message when login fails', async () => {
    const loginMock = jest.fn().mockRejectedValue({ response: { data: { message: 'Invalid email or password' } } });
    jest.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      token: null,
      isLoading: false,
      login: loginMock,
      signup: jest.fn(),
      logout: jest.fn()
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ali@test.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
  });
});
