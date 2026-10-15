import axios from 'axios';
import { MessageDto } from '../dto/message.dto';

export const getMessagesBetweenUsers = async (senderId: string, receiverId: string): Promise<MessageDto[]> => {
  const response = await axios.get(`/api/messages/${senderId}/${receiverId}`);
  if (response.status != 200) {
    throw new Error(response.data.error);
  } else {
    return response.data as MessageDto[];
  }
};

export const createMessage = async (message: MessageDto) => {
  const response = await axios.post(`/api/messages`, message);
  if (response.status != 201) {
    throw new Error(response.data.error);
  } else {
    return response.data;
  }
};
