import mongoose, { Schema, Document } from 'mongoose';
import { ObjectId } from 'mongodb';

interface IBoard extends Document {
  name: string;
  owner: ObjectId;
  users: mongoose.Schema.Types.ObjectId[];
}

const BoardSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  owner: { type: ObjectId, ref: 'User', required: true },
  users: [{ type: ObjectId, ref: 'User' }],
});

const Board = mongoose.model<IBoard>('Board', BoardSchema);
export default Board;
