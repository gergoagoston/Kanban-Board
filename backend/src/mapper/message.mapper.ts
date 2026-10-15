import { plainToInstance } from 'class-transformer';
import { MessageOutDto } from '../dto/message.dto';

export class MessageMapper {
  static modelToDto(message: any): MessageOutDto {
    return plainToInstance(MessageOutDto, {
      _id: message._id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      content: message.content,
      timestamp: message.timestamp,
    });
  }

  static modelsToDtos(messages: any[]): MessageOutDto[] {
    return messages.map((message) => MessageMapper.modelToDto(message));
  }
}

export default MessageMapper;
