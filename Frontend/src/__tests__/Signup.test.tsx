import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Signup from '../pages/Signup';
import * as AuthContext from '../context/AuthContext';

describe('Signup page', () => {
  it('blocks submission when the password is too short', async () => {
    const signupMock = jest.fn();
    jest.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      token: null,
      isLoading: false,
      login: jest.fn(),
      signup: signupMock,
      logout: jest.fn()
    });

    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ali' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ali@test.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText('Password should be at least 6 characters.')).toBeInTheDocument();
    expect(signupMock).not.toHaveBeenCalled();
  });
});
