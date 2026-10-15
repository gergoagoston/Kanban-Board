import { ObjectId } from 'mongodb';
import mongoose, { Schema, Document } from 'mongoose';
import User from './user.model';

interface IMessage extends Document {
  senderId: ObjectId;  // User who sent the message
  receiverId: ObjectId;  // User who received the message
  content: string;
  timestamp: Date;
}

const MessageSchema: Schema = new Schema({
  senderId: { type: ObjectId, required: true, ref: User },
  receiverId: { type: ObjectId, required: true, ref: User },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model<IMessage>('Message', MessageSchema);
export default Message;
