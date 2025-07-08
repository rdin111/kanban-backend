import { Schema, model, Document,Types  } from 'mongoose';

export interface ITask extends Document {
    _id: Types.ObjectId;
    title: string;
    description?: string;
}

const TaskSchema = new Schema<ITask>({
    title: { type: String, required: true },
    description: { type: String },
}, { timestamps: true });

export default model<ITask>('Task', TaskSchema);