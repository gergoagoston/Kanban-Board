import axios from 'axios';
import { UserDto, UserIdTokenDto } from '../dto/user.dto';

export default async function loginAPI(user: UserDto): Promise<UserIdTokenDto> {
  const response = await axios.post(`/api/auth/login`, user, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (response.status != 200) {
    throw new Error(response.data.error);
  } else {
    return response.data as UserIdTokenDto;
  }
}
