import axios from "axios";
import { BoardDetailedDto, BoardInDto, BoardOutDto } from "../dto/board.dto";
import { TaskInDto } from "../dto/task.dto";

export const getUsersBoards = async (id: string): Promise<BoardInDto[]> => {
  const response = await axios.get(`/api/users/${id}/boards`);
  if (response.status != 200) {
    throw new Error(response.data.error);
  } else {
    return response.data as BoardInDto[];
  }
};

export const getBoardsTasks = async (id: string, estimation: boolean): Promise<BoardDetailedDto> => {
  const response = await axios.get(`/api/boards/${id}?hasEstimation=${estimation}`);
  if (response.status != 200) {
    throw new Error(response.data.error);
  } else {
    console.log(response.data);

    return response.data as BoardDetailedDto;
  }
};

export const getBoardsTasksWithVoting = async (id: string, userId: string, estimation:boolean): Promise<TaskInDto[]> => {
	const response = await axios.get(`/api/boards/${id}/users/${userId}?hasEstimation=${estimation}`);
	if (response.status != 200) {
		throw new Error(response.data.error);
	} else {
		console.log(response.data);

		return response.data as TaskInDto[];
	}
};

export const createBoard = async (board: BoardOutDto): Promise<BoardDetailedDto> => {
  const response = await axios.post(`/api/boards`, board);
  if (response.status != 200) {
    throw new Error(response.data.error);
  } else {
    return response.data as BoardDetailedDto;
  }
};

export const joinBoard = async (id: string, userId: string): Promise<BoardDetailedDto> => {
  const response = await axios.patch(`/api/boards/${id}/users/${userId}`);
  if (response.status != 200) {
    throw new Error(response.data.error);
  } else {
    return response.data as BoardDetailedDto;
  }
};
