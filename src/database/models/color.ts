import { Schema, type Types } from "mongoose";

export interface Color extends Document {
    _id: Types.ObjectId;
    color: string;
    inStock: boolean;
}

export const ColorSchema = new Schema<Color>(
    {
        color: { type: String, required: true, trim: true },
        inStock: { type: Boolean, required: true, default: true },
    },
    { _id: true }
);
