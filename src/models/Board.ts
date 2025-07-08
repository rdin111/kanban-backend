// src/models/Board.ts

import { Schema, model, Document, Types } from 'mongoose';

// Define the structure for a column
export interface IColumn extends Document { // Extend Document for subdocuments
    _id: Types.ObjectId;
    name: string;
    tasks: Types.ObjectId[]; // Array of Task IDs
}

export interface IBoard extends Document {
    name: string;
    // This is the key change: Use Types.DocumentArray
    columns: Types.DocumentArray<IColumn>;
    user: Types.ObjectId; // Reference to the User
    isPublic: boolean;
    publicId?: string;
}

const ColumnSchema = new Schema<IColumn>({
    name: { type: String, required: true },
    tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
});

const BoardSchema = new Schema<IBoard>({
    name: { type: String, required: true },
    columns: [ColumnSchema],
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isPublic: { type: Boolean, default: false },
    publicId: { type: String, unique: true, sparse: true },
}, { timestamps: true });

export default model<IBoard>('Board', BoardSchema);