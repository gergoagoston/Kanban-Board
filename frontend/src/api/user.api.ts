import axios from 'axios';
// import { UserInDto } from "../dto/user.dto";
import { BoardInDtoWithUserList } from '../dto/board.dto';
import { UserInDto } from '../dto/user.dto';

export const getBoardUsers = async (id: string): Promise<BoardInDtoWithUserList> => {
  const response = await axios.get(`/api/boards/${id}/users`);
  if (response.status != 200) {
    throw new Error(response.data.error);
  } else {
    return response.data as BoardInDtoWithUserList;
  }
};

export const removeUserFromBoard = async (boardId: string, userId: string) => {
  const response = await axios.delete(`/api/boards/${boardId}/users/${userId}`);
  if (response.status != 204) {
    throw new Error(response.data.error);
  }
};

export const getAllUsers = async () => {
  const response = await axios.get('/api/users');
  if (response.status != 200) {
    throw new Error(response.data.error);
  } else {
    return response.data as UserInDto[];
  }
}
