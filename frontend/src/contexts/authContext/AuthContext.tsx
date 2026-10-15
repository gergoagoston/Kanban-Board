import { createContext } from 'react';
import { UserDto, UserIdTokenDto } from '../../dto/user.dto';

interface UserContextType {
  user: UserIdTokenDto | null;
  register(user: UserDto): void;
  loginUser(user: UserDto): Promise<{ success: boolean; error?: string }>;
  logout(): void;
  isLoggedIn(): boolean;
}

export const AuthContext = createContext<UserContextType>({} as UserContextType);
