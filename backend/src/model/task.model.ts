import mongoose, { Schema, Document, Model } from 'mongoose';
import { ObjectId } from 'mongodb';

export interface ITask extends Document {
  title: string;
  content: string;
  date: Date;

  status: number;         // 0 -> not voted yet | 1-> voted | 2-> to do | 3 -> in progress | 4-> done
  priority: number;       // 0 -> low | 1 -> medium | 2 -> high
  assignedId: ObjectId;   // user id
  boardId: ObjectId;
  hasEstimation: boolean; // if estimation exists true
  estimation?: number;
}

interface TaskModel extends Model<ITask> {
  byEstimation(estimation: boolean): Promise<ITask[]>;
}

const TaskSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: Date, required: true },

    status: { type: Number, default: 0 },
    priority: { type: Number, default: 0 },
    assignedId: { type: ObjectId, ref: 'User' },
    boardId: { type: ObjectId, ref: 'Board', required: true },
    hasEstimation: { type: Boolean, default: false }, // Auto-set field
    estimation: {
      type: Number,
      set: function (value: number) {
        // Automatically set `hasEstimation` when `estimation` is defined
        (this as ITask).hasEstimation = value !== undefined && value !== null;
        return value;
      },
    },
  },
  {
    query: {
      byEstimation(estimation: boolean) {
        return this.find({ hasEstimation: estimation });
      },
    },
  },
);

TaskSchema.pre('save', function (next) {
  if (this.isModified('estimation')) {
    this.hasEstimation = this.estimation !== undefined && this.estimation !== null;
  }
  next();
});

const Task = mongoose.model<ITask, TaskModel>('Task', TaskSchema);
export default Task;
