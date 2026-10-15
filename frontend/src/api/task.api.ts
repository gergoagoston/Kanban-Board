import axios from "axios";
import { TaskCreateDto, TaskInDto } from "../dto/task.dto";

export const deleteTask = async (id: string) => {
  const response = await axios.delete(`/api/tasks/${id}`);
  if (response.status != 204) {
    throw new Error(response.data.error);
  }
};

export const updateTask = async (task:TaskInDto) => {
	const response = await axios.patch(`/api/tasks/${task._id}`,task);
	if (response.status != 200) {
		throw new Error(response.data.error);
	}
	return response.data
}

export const insertTask = async (task: TaskCreateDto) => {
  const response = await axios.post(`/api/tasks`, task);
  if (response.status != 200) {
    throw new Error(response.data.error);
  }
  return response.data;
};
