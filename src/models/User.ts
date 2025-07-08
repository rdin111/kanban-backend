import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document{
    email : string;
    googleId: string;
    name: string;
    isAnonymous?: boolean; // Add this optional flag
}

const userSchema = new Schema<IUser>({
    email: {type: String, unique: true, required: true},
    googleId: {type: String, unique: true, required: true},
    name: {type: String, required: true},
    isAnonymous: { type: Boolean, default: false }, // Add to schema
},{ timestamps: true });

export default model<IUser>("User", userSchema);