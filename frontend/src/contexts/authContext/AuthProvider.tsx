import { UserDto, UserIdTokenDto } from '../../dto/user.dto';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import loginAPI from '../../api/login.api';
import { AuthContext } from './AuthContext';
import axios from 'axios';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserIdTokenDto | null>(null); // Combined user object
  const [isReady, setIsReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user'); // Get the user object from localStorage
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // If user exists, set it in state
    }
    setIsReady(true);
  }, []);

  const loginUser = async (user: UserDto): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await loginAPI(user); // Call API to login
      const { _id, token, username } = response; // Destructure the user data from response

      const userData: UserIdTokenDto = { _id, token, username }; // Combine into a user object

      // Save the user object in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `${token}`;
      // Set the user state
      setUser(userData);

      return { success: true }; // Indicate success
    } catch (error) {
      console.error('Login failed:', error);

      if (axios.isAxiosError(error)) {
        if (error.response) {
          return {
            success: false,
            error: error.response.data.error || 'Login failed. Please try again.',
          };
        } else {
          return {
            success: false,
            error: 'No response received from the server. Please check your connection.',
          };
        }
      }
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      };
    }
  };

  const register = () => {
    // Implement registration logic if needed
  };

  const isLoggedIn = (): boolean => {
    return user !== null; // Check if user is logged in by checking if user exists
  };

  const logout = () => {
    setUser(null); // Clear user state
    navigate('/'); // Navigate to home or login page
    localStorage.removeItem('user'); // Remove user data from localStorage
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logout, register, isLoggedIn }}>
      {isReady ? children : null} {/* Ensure children are rendered only after the context is ready */}
    </AuthContext.Provider>
  );
};
